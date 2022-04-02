<script lang="ts">
    import { Router, Route } from "svelte-routing";

    import Landing from "./routes/Landing.svelte";

    export let url: string = "";
</script>

<Router {url}>
    <div>
        <Route path="/"><Landing /></Route>
    </div>
</Router>
