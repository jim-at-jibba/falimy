import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import { getPocketBase } from "../../api/pocketbase";
import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import { FormError } from "../../components/Form/FormError";
import { FormInputText } from "../../components/Form/FormInputText";
import Title from "../../components/Title";
import { generateInviteCode, generateTopicPrefix } from "../../utils/invite";

const schema = z.object({
  familyName: z.string().min(1, "Family name is required."),
  name: z.string().min(1, "Your name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type Schema = z.infer<typeof schema>;

export default function CreateFamily() {
  const [loading, setLoading] = useState(false);

  const methods = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { familyName: "", name: "", email: "", password: "" },
  });

  const onSubmit = async (data: Schema) => {
    setLoading(true);

    try {
      const pb = await getPocketBase();
      if (!pb) {
        router.replace("/(auth)/server-url");
        return;
      }

      const user = await pb.collection("users").create({
        email: data.email.trim(),
        password: data.password,
        passwordConfirm: data.password,
        name: data.name.trim(),
        role: "admin",
      });

      await pb.collection("users").authWithPassword(data.email.trim(), data.password);

      const family = await pb.collection("families").create({
        name: data.familyName.trim(),
        invite_code: generateInviteCode(),
        ntfy_topic_prefix: generateTopicPrefix(),
        created_by: user.id,
      });

      await pb.collection("users").update(user.id, {
        family_id: family.id,
        role: "admin",
      });

      router.replace("/(tabs)");
    } catch {
      methods.setError("root", {
        message: "Could not create the family. Check your details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Title text="Create a Family" />
        <DefaultText text="This account will become the admin." />

        <FormProvider {...methods}>
          <FormInputText<Schema> name="familyName" placeholder="Family name" returnKeyType="next" />

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
            label={loading ? "Creating..." : "Create Family"}
            onPress={methods.handleSubmit(onSubmit)}
            disabled={loading}
          />
        </FormProvider>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing[4],
  },
}));
