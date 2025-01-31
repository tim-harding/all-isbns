import "./assets/shared.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import Viewer from "./components/Viewer.vue";

const app = createApp(Viewer);
app.use(createPinia());
app.mount("#app");
