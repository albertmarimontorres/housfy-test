import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "./guards";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";

const DashboardView = () => import("@/views/DashboardView.vue");
const RealEstateView = () => import("@/views/RealEstateView.vue");
const RentalsView = () => import("@/views/RentalsView.vue");
const MortgagesView = () => import("@/views/MortgagesView.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { public: true }
    },
    {
      path: "/register",
      name: "Register",
      component: RegisterView,
      meta: { public: true }
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: DashboardView,
      beforeEnter: authGuard
    },
    {
      path: "/real-estate",
      name: "RealEstate",
      component: RealEstateView,
      beforeEnter: authGuard
    },
    {
      path: "/rentals",
      name: "Rentals",
      component: RentalsView,
      beforeEnter: authGuard
    },
    {
      path: "/mortgages",
      name: "Mortgages",
      component: MortgagesView,
      beforeEnter: authGuard
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login"
    }
  ]
});

export default router;
