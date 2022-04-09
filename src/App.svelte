<script lang="ts">
    import { Router, Route } from "svelte-routing";

    import Landing from "./routes/Landing.svelte";
    import Chat from "./routes/Chat.svelte";

    export let url: string = "";

    import Dexie from "dexie";

    const db: Dexie = new Dexie("CryptoChat");
    db.version(1).stores({
        history: "++id, username, key, timestamp",
    });

    db.open().catch(function (e) {
        alert("Open failed: " + e);
    });
</script>

<Router {url}>
    <Route path="/"><Landing {db} /></Route>
    <Route path="chat"><Chat /></Route>
</Router>
