// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  // ✅ 你想“点按钮才登录”，那就不要在这里保护 "/" 页面
  // 这里只保护你真正想锁的东西（建议先不锁 /api，改成在 route.ts 里返回 401）
  // "/generate(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
