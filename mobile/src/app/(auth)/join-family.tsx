import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import { getPocketBase, resetPocketBase, validateServerUrl } from "@/api/pocketbase";
import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";
import { FormError } from "@/components/Form/FormError";
import { FormInputText } from "@/components/Form/FormInputText";
import { Header } from "@/components/Navigation/Header";
import { setServerUrl } from "@/utils/config";

type JoinParams = {
  server?: string;
  invite?: string;
  familyId?: string;
};

const schema = z.object({
  server: z.string().min(1, "Server URL is required."),
  inviteCode: z.string().min(1, "Invite code is required."),
  familyId: z.string().min(1, "Family ID is required."),
  name: z.string().min(1, "Your name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type Schema = z.infer<typeof schema>;

export default function JoinFamily() {
  const params = useLocalSearchParams<JoinParams>();
  const [loading, setLoading] = useState(false);

  const methods = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      server: params.server ?? "",
      inviteCode: params.invite ?? "",
      familyId: params.familyId ?? "",
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!params.server) return;

    const applyServer = async () => {
      try {
        const normalized = await validateServerUrl(params.server as string);
        await setServerUrl(normalized);
        resetPocketBase();
        methods.setValue("server", normalized);
      } catch {
        methods.setError("server", {
          message: "Could not validate the server URL from the QR code.",
        });
      }
    };

    applyServer();
  }, [params.server, methods]);

  const onSubmit = async (data: Schema) => {
    setLoading(true);

    try {
      // Step 1: Validate and set server URL
      const normalized = await validateServerUrl(data.server);
      await setServerUrl(normalized);
      resetPocketBase();

      const pb = await getPocketBase();
      if (!pb) {
        methods.setError("root", {
          message: "Could not connect to server. Check the server URL.",
        });
        setLoading(false);
        return;
      }

      // Step 2: Call server-side join endpoint
      // Invite code is validated server-side and never exposed to the client.
      const response = await fetch(`${pb.baseUrl}/api/falimy/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId: data.familyId.trim(),
          inviteCode: data.inviteCode.trim(),
          email: data.email.trim(),
          password: data.password,
          name: data.name.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = result?.message || "Could not join the family. Check your details and try again.";

        // Map server errors to specific form fields where possible
        if (response.status === 404) {
          methods.setError("familyId", { message });
        } else if (response.status === 401) {
          methods.setError("inviteCode", { message });
        } else if (response.status === 409) {
          methods.setError("email", { message });
        } else {
          methods.setError("root", { message });
        }

        setLoading(false);
        return;
      }

      // Step 3: Hydrate auth store with the returned token
      pb.authStore.save(result.token, result.record);

      router.replace("/(tabs)");
    } catch (err) {
      methods.setError("root", {
        message: "Could not join the family. Check your details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Header title="Join Family" showBack backgroundColor="#b4dbfa" />
      <View style={styles.container}>
        <DefaultText text="Use the invite from your family admin." />

        <FormProvider {...methods}>
          <FormInputText<Schema>
            name="server"
            placeholder="Server URL"
            autoCapitalize="none"
            keyboardType="url"
            returnKeyType="next"
          />

          <FormInputText<Schema>
            name="inviteCode"
            placeholder="Invite code"
            autoCapitalize="none"
            returnKeyType="next"
          />

          <FormInputText<Schema>
            name="familyId"
            placeholder="Family ID"
            autoCapitalize="none"
            returnKeyType="next"
          />

          <FormInputText<Schema> name="name" placeholder="Your name" returnKeyType="next" />

          <FormInputText<Schema>
            name="email"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <FormInputText<Schema>
            name="password"
            placeholder="Password"
            secureTextEntry
            textContentType="newPassword"
            onSubmitEditing={methods.handleSubmit(onSubmit)}
          />

          <FormError message={methods.formState.errors.root?.message} />

          <Button
            label={loading ? "Joining..." : "Join Family"}
            onPress={methods.handleSubmit(onSubmit)}
            disabled={loading}
          />
        </FormProvider>

        <Button
          label="Scan QR Code"
          onPress={() => router.push("/(auth)/scan-qr")}
          variant="secondary"
        />
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
}));
