import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/WelcomeScreen" />;
}