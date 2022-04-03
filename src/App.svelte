<script lang="ts">
    import { Router, Route } from "svelte-routing";

    import Landing from "./routes/Landing.svelte";
    import Chat from "./routes/Chat.svelte";

    export let url: string = "";
</script>

<Router {url}>
    <Route path="/"><Landing /></Route>
    <Route path="chat"><Chat /></Route>
</Router>
