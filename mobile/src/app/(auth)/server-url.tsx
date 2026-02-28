import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import { resetPocketBase, validateServerUrl } from "@/api/pocketbase";
import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";
import { FormError } from "@/components/Form/FormError";
import { FormInputText } from "@/components/Form/FormInputText";
import { Header } from "@/components/Navigation/Header";
import { getServerUrl, setServerUrl } from "@/utils/config";

const schema = z.object({
  serverUrl: z.string().min(1, "Enter your PocketBase server URL."),
});

type Schema = z.infer<typeof schema>;

export default function ServerUrl() {
  const [loading, setLoading] = useState(false);

  const methods = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { serverUrl: "" },
  });

  useEffect(() => {
    getServerUrl().then((url) => {
      if (url) methods.setValue("serverUrl", url);
    });
  }, [methods]);

  const onSubmit = async (data: Schema) => {
    setLoading(true);

    try {
      const normalized = await validateServerUrl(data.serverUrl);
      await setServerUrl(normalized);
      resetPocketBase();
      router.replace("/(auth)");
    } catch {
      methods.setError("root", {
        message: "Could not reach that server. Check the URL and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Header title="Connect to PocketBase" showBack backgroundColor="#b4dbfa" />
      <View style={styles.container}>
        <DefaultText text="Enter the URL where your family hosts PocketBase." />

        <FormProvider {...methods}>
          <FormInputText<Schema>
            name="serverUrl"
            placeholder="https://family.example.com"
            autoCapitalize="none"
            keyboardType="url"
            onSubmitEditing={methods.handleSubmit(onSubmit)}
          />

          <FormError message={methods.formState.errors.root?.message} />

          <Button
            label={loading ? "Saving..." : "Save and Continue"}
            onPress={methods.handleSubmit(onSubmit)}
            disabled={loading}
          />

          {loading ? <ActivityIndicator style={styles.loader} /> : null}
        </FormProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing[4],
  },
  loader: {
    marginTop: theme.spacing[3],
  },
}));
