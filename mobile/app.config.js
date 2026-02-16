import appJson from "./app.json" with { type: "json" };

export default ({ config }) => ({
  ...config,
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "",
        },
      },
    },
  },
});
