const express = require('express');
const app = express();
const port = 3000;
try {
    app.listen(port, () => console.log(`Test Server running on http://localhost:${port}`));
    setInterval(() => console.log('Heartbeat'), 1000);
} catch (e) {
    console.error(e);
}
