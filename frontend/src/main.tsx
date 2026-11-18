import { StrictMode } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { LazyMotion, MotionConfig } from "motion/react";
import { createRoot } from "react-dom/client";
import { router } from "./app/router";
import "./index.css";

const loadMotionFeatures = () =>
  import("motion/react").then((mod) => mod.domAnimation);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <RouterProvider router={router} />
      </LazyMotion>
    </MotionConfig>
  </StrictMode>
);

