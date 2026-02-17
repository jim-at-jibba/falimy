package handlers

import (
	"encoding/json"
	"falimy-server/internal/ratelimit"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

type ExtractRecipeRequest struct {
	URL string `json:"url" form:"url"`
}

type RecipeResponse struct {
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Ingredients []Ingredient    `json:"ingredients"`
	Steps       []Step          `json:"steps"`
	PrepTime    *int            `json:"prep_time"`
	CookTime    *int            `json:"cook_time"`
	TotalTime   *int            `json:"total_time"`
	Servings    string          `json:"servings"`
	ImageURL    string          `json:"image_url"`
	SourceURL   string          `json:"source_url"`
}

type Ingredient struct {
	Text string `json:"text"`
}

type Step struct {
	Text     string `json:"text"`
	Position int    `json:"position"`
}

var extractClient = &http.Client{
	Timeout: 15 * time.Second,
	CheckRedirect: func(req *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	},
}

func ExtractRecipe(app core.App) func(e *core.RequestEvent) error {
	rl := ratelimit.New(30, 15*60*1000)

	return func(e *core.RequestEvent) error {
		ip := e.RealIP()
		if !rl.Allow(ip) {
			return e.JSON(http.StatusTooManyRequests, map[string]string{
				"message": "Rate limit exceeded. Try again later.",
			})
		}

		var req ExtractRecipeRequest
		if err := e.BindBody(&req); err != nil {
			return e.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body."})
		}

		rawURL := strings.TrimSpace(req.URL)
		if rawURL == "" {
			return e.JSON(http.StatusBadRequest, map[string]string{"message": "URL is required."})
		}

		parsedURL, err := url.Parse(rawURL)
		if err != nil {
			return e.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid URL format."})
		}

		if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
			return e.JSON(http.StatusBadRequest, map[string]string{"message": "URL must be HTTP or HTTPS."})
		}

		hostname := strings.ToLower(parsedURL.Hostname())
		if isPrivateIP(hostname) {
			return e.JSON(http.StatusBadRequest, map[string]string{"message": "Cannot fetch from internal or private network addresses."})
		}

		httpReq, err := http.NewRequest("GET", rawURL, nil)
		if err != nil {
			return e.JSON(http.StatusBadRequest, map[string]string{"message": "Failed to create request."})
		}
		httpReq.Header.Set("User-Agent", "Falimy/1.0 (Recipe Extractor)")
		httpReq.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")

		resp, err := extractClient.Do(httpReq)
		if err != nil {
			return e.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch URL: " + err.Error()})
		}
		defer resp.Body.Close()

		if resp.StatusCode != 200 {
			return e.JSON(http.StatusInternalServerError, map[string]string{"message": fmt.Sprintf("Failed to fetch URL: HTTP %d", resp.StatusCode)})
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return e.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to read response."})
		}

		html := string(body)

		recipe := findJSONLDRecipe(html)
		if recipe == nil {
			recipe = findMicrodataRecipe(html)
		}

		if recipe == nil {
			return e.JSON(http.StatusUnprocessableEntity, map[string]string{
				"message": "No recipe data found on this page. Please enter the recipe manually.",
			})
		}

		result := normalizeRecipe(recipe, rawURL)

		if result.Title == "" && len(result.Ingredients) == 0 && len(result.Steps) == 0 {
			return e.JSON(http.StatusUnprocessableEntity, map[string]string{
				"message": "Could not extract useful recipe data from this page. Please enter the recipe manually.",
			})
		}

		return e.JSON(http.StatusOK, result)
	}
}

func isPrivateIP(hostname string) bool {
	if hostname == "localhost" || hostname == "127.0.0.1" || hostname == "[::1]" || hostname == "0.0.0.0" {
		return true
	}
	if strings.HasPrefix(hostname, "10.") || strings.HasPrefix(hostname, "192.168.") || strings.HasPrefix(hostname, "169.254.") {
		return true
	}
	if matched, _ := regexp.MatchString(`^172\.(1[6-9]|2\d|3[01])\.`, hostname); matched {
		return true
	}
	if strings.HasSuffix(hostname, ".local") || strings.HasSuffix(hostname, ".internal") {
		return true
	}

	ip := net.ParseIP(hostname)
	if ip != nil {
		if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() {
			return true
		}
	}

	return false
}

type rawRecipe struct {
	Name              string          `json:"name"`
	Description       string          `json:"description"`
	RecipeIngredient  json.RawMessage `json:"recipeIngredient"`
	RecipeInstructions json.RawMessage `json:"recipeInstructions"`
	PrepTime          string          `json:"prepTime"`
	CookTime          string          `json:"cookTime"`
	TotalTime         string          `json:"totalTime"`
	RecipeYield       json.RawMessage `json:"recipeYield"`
	Image             json.RawMessage `json:"image"`
}

func findJSONLDRecipe(html string) *rawRecipe {
	re := regexp.MustCompile(`<script[^>]*type\s*=\s*["']application/ld\+json["'][^>]*>([\s\S]*?)</script>`)
	matches := re.FindAllStringSubmatch(html, -1)

	for _, match := range matches {
		if len(match) < 2 {
			continue
		}
		content := match[1]
		var data json.RawMessage
		if err := json.Unmarshal([]byte(content), &data); err != nil {
			continue
		}
		recipe := findRecipeInJSONLD(data)
		if recipe != nil {
			return recipe
		}
	}

	return nil
}

func findRecipeInJSONLD(data json.RawMessage) *rawRecipe {
	var arr []json.RawMessage
	if err := json.Unmarshal(data, &arr); err == nil {
		for _, item := range arr {
			recipe := findRecipeInJSONLD(item)
			if recipe != nil {
				return recipe
			}
		}
		return nil
	}

	var obj map[string]json.RawMessage
	if err := json.Unmarshal(data, &obj); err != nil {
		return nil
	}

	typeRaw, hasType := obj["@type"]
	if hasType {
		var typeStr string
		if err := json.Unmarshal(typeRaw, &typeStr); err == nil {
			if typeStr == "Recipe" {
				return parseRawRecipe(obj)
			}
		}
		var typeArr []string
		if err := json.Unmarshal(typeRaw, &typeArr); err == nil {
			for _, t := range typeArr {
				if t == "Recipe" {
					return parseRawRecipe(obj)
				}
			}
		}
	}

	if graphRaw, hasGraph := obj["@graph"]; hasGraph {
		return findRecipeInJSONLD(graphRaw)
	}

	return nil
}

func parseRawRecipe(obj map[string]json.RawMessage) *rawRecipe {
	recipe := &rawRecipe{}
	if name, ok := obj["name"]; ok {
		json.Unmarshal(name, &recipe.Name)
	}
	if desc, ok := obj["description"]; ok {
		json.Unmarshal(desc, &recipe.Description)
	}
	if ingredients, ok := obj["recipeIngredient"]; ok {
		recipe.RecipeIngredient = ingredients
	}
	if instructions, ok := obj["recipeInstructions"]; ok {
		recipe.RecipeInstructions = instructions
	}
	if prep, ok := obj["prepTime"]; ok {
		json.Unmarshal(prep, &recipe.PrepTime)
	}
	if cook, ok := obj["cookTime"]; ok {
		json.Unmarshal(cook, &recipe.CookTime)
	}
	if total, ok := obj["totalTime"]; ok {
		json.Unmarshal(total, &recipe.TotalTime)
	}
	if yield, ok := obj["recipeYield"]; ok {
		recipe.RecipeYield = yield
	}
	if image, ok := obj["image"]; ok {
		recipe.Image = image
	}
	return recipe
}

func findMicrodataRecipe(html string) *rawRecipe {
	re := regexp.MustCompile(`(?i)<[^>]*itemtype\s*=\s*["']https?://schema\.org/Recipe["'][^>]*>`)
	match := re.FindStringIndex(html)
	if match == nil {
		return nil
	}

	start := match[0]
	end := start + 50000
	if end > len(html) {
		end = len(html)
	}
	searchRange := html[start:end]

	recipe := &rawRecipe{}

	nameRe := regexp.MustCompile(`(?i)itemprop\s*=\s*["']name["'][^>]*>([^<]*)<`)
	if nameMatch := nameRe.FindStringSubmatch(searchRange); len(nameMatch) > 1 {
		recipe.Name = strings.TrimSpace(nameMatch[1])
	}

	descRe := regexp.MustCompile(`(?i)itemprop\s*=\s*["']description["'][^>]*>([^<]*)<`)
	if descMatch := descRe.FindStringSubmatch(searchRange); len(descMatch) > 1 {
		recipe.Description = strings.TrimSpace(descMatch[1])
	}

	ingRe := regexp.MustCompile(`(?i)itemprop\s*=\s*["']recipeIngredient["'][^>]*>([^<]*)<`)
	ingredients := ingRe.FindAllStringSubmatch(searchRange, -1)
	var ingList []string
	for _, m := range ingredients {
		if len(m) > 1 {
			ingList = append(ingList, strings.TrimSpace(m[1]))
		}
	}
	if len(ingList) > 0 {
		recipe.RecipeIngredient, _ = json.Marshal(ingList)
	}

	instRe := regexp.MustCompile(`(?i)(&itemprop\s*=\s*["']text["']|itemprop\s*=\s*["']recipeInstructions["'])[^>]*>([^<]*)<`)
	instructions := instRe.FindAllStringSubmatch(searchRange, -1)
	var instList []string
	for _, m := range instructions {
		if len(m) > 2 {
			instList = append(instList, strings.TrimSpace(m[2]))
		}
	}
	if len(instList) > 0 {
		recipe.RecipeInstructions, _ = json.Marshal(instList)
	}

	if recipe.Name == "" && len(ingList) == 0 {
		return nil
	}

	return recipe
}

func normalizeRecipe(raw *rawRecipe, sourceURL string) *RecipeResponse {
	return &RecipeResponse{
		Title:       raw.Name,
		Description: raw.Description,
		Ingredients: extractIngredients(raw.RecipeIngredient),
		Steps:       extractSteps(raw.RecipeInstructions),
		PrepTime:    parseDuration(raw.PrepTime),
		CookTime:    parseDuration(raw.CookTime),
		TotalTime:   parseDuration(raw.TotalTime),
		Servings:    extractServings(raw.RecipeYield),
		ImageURL:    extractImageURL(raw.Image),
		SourceURL:   sourceURL,
	}
}

func parseDuration(iso string) *int {
	if iso == "" {
		return nil
	}
	re := regexp.MustCompile(`P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?`)
	matches := re.FindStringSubmatch(iso)
	if matches == nil {
		return nil
	}

	days := parseInt(matches[1])
	hours := parseInt(matches[2])
	minutes := parseInt(matches[3])
	seconds := parseInt(matches[4])

	total := days*1440 + hours*60 + minutes + (seconds+30)/60
	return &total
}

func parseInt(s string) int {
	var result int
	fmt.Sscanf(s, "%d", &result)
	return result
}

func extractIngredients(raw json.RawMessage) []Ingredient {
	var ingredients []Ingredient

	var arr []string
	if err := json.Unmarshal(raw, &arr); err == nil {
		for _, s := range arr {
			s = strings.TrimSpace(s)
			if s != "" {
				ingredients = append(ingredients, Ingredient{Text: s})
			}
		}
		return ingredients
	}

	var single string
	if err := json.Unmarshal(raw, &single); err == nil {
		single = strings.TrimSpace(single)
		if single != "" {
			ingredients = append(ingredients, Ingredient{Text: single})
		}
	}

	return ingredients
}

func extractSteps(raw json.RawMessage) []Step {
	var steps []Step

	var strArr []string
	if err := json.Unmarshal(raw, &strArr); err == nil {
		for i, s := range strArr {
			s = strings.TrimSpace(s)
			if s != "" {
				steps = append(steps, Step{Text: s, Position: i + 1})
			}
		}
		return steps
	}

	var single string
	if err := json.Unmarshal(raw, &single); err == nil {
		single = strings.TrimSpace(single)
		if single != "" {
			steps = append(steps, Step{Text: single, Position: 1})
		}
		return steps
	}

	var objArr []map[string]json.RawMessage
	if err := json.Unmarshal(raw, &objArr); err == nil {
		for i, obj := range objArr {
			if itemList, hasList := obj["itemListElement"]; hasList {
				var subArr []map[string]json.RawMessage
				if err := json.Unmarshal(itemList, &subArr); err == nil {
					for _, sub := range subArr {
						text := getStepText(sub)
						if text != "" {
							steps = append(steps, Step{Text: text, Position: len(steps) + 1})
						}
					}
				}
			} else {
				text := getStepText(obj)
				if text != "" {
					steps = append(steps, Step{Text: text, Position: i + 1})
				}
			}
		}
	}

	return steps
}

func getStepText(obj map[string]json.RawMessage) string {
	if textRaw, ok := obj["text"]; ok {
		var text string
		if json.Unmarshal(textRaw, &text) == nil && text != "" {
			return strings.TrimSpace(text)
		}
	}
	if nameRaw, ok := obj["name"]; ok {
		var name string
		if json.Unmarshal(nameRaw, &name) == nil && name != "" {
			return strings.TrimSpace(name)
		}
	}
	return ""
}

func extractServings(raw json.RawMessage) string {
	var arr []string
	if err := json.Unmarshal(raw, &arr); err == nil && len(arr) > 0 {
		return arr[0]
	}

	var single string
	if err := json.Unmarshal(raw, &single); err == nil {
		return single
	}

	return ""
}

func extractImageURL(raw json.RawMessage) string {
	var str string
	if err := json.Unmarshal(raw, &str); err == nil {
		return str
	}

	var strArr []string
	if err := json.Unmarshal(raw, &strArr); err == nil && len(strArr) > 0 {
		return strArr[0]
	}

	var obj struct {
		URL string `json:"url"`
	}
	if err := json.Unmarshal(raw, &obj); err == nil && obj.URL != "" {
		return obj.URL
	}

	var objArr []struct {
		URL string `json:"url"`
	}
	if err := json.Unmarshal(raw, &objArr); err == nil && len(objArr) > 0 {
		return objArr[0].URL
	}

	return ""
}
