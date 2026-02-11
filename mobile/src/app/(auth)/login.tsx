import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import { getPocketBase } from "@/api/pocketbase";
import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";
import { FormError } from "@/components/Form/FormError";
import { FormInputText } from "@/components/Form/FormInputText";
import Title from "@/components/Title";

const schema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type Schema = z.infer<typeof schema>;

export default function Login() {
  const [loading, setLoading] = useState(false);

  const methods = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: Schema) => {
    setLoading(true);

    try {
      const pb = await getPocketBase();
      if (!pb) {
        router.replace("/(auth)/server-url");
        return;
      }

      await pb.collection("users").authWithPassword(data.email.trim(), data.password);
      router.replace("/(tabs)");
    } catch {
      methods.setError("root", {
        message: "Login failed. Check your email and password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Title text="Log In" />
        <DefaultText text="Use your family account credentials." />

        <FormProvider {...methods}>
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
            textContentType="password"
            onSubmitEditing={methods.handleSubmit(onSubmit)}
          />

          <FormError message={methods.formState.errors.root?.message} />

          <Button
            label={loading ? "Signing In..." : "Sign In"}
            onPress={methods.handleSubmit(onSubmit)}
            disabled={loading}
          />
        </FormProvider>

        <Button
          label="Need to join a family?"
          onPress={() => router.push("/(auth)/join-family")}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing[4],
  },
}));
