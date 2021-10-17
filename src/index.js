const express = require('express')
const cors = require('cors')
const {randomFillSync} = require('crypto')
const client = require('prom-client')
const {networkInterfaces} = require('os');
const app = express();
const nets = networkInterfaces();
const packageJson = require('../package.json');
const {Buffer} = require('buffer');

const randomNumber = `Mr:${Math.random()}:ts:${Date.now()}`
app.memo_leak = [];

function loadCPU(n) {
    if (n < 2)
        return 1;
    else return loadCPU(n - 2) + loadCPU(n - 1);
}

// Create a Registry which registers the metrics
const register = new client.Registry()
// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'example-nodejs-app'
})

// Enable the collection of default metrics
client.collectDefaultMetrics({register})
// Create a histogram metric
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in microseconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})
// Register the histogram
register.registerMetric(httpRequestDurationMicroseconds)

app.use(cors())

app.get('/', (req, res) => {
    const resp = {
        network: nets,
        message: 'Hello World! Resp from Nodejs',
        version: packageJson.version,
        randomNumber
    };
    res.json(resp)
})


app.get('/load/:num', async (req, res) => {
    const resp = {
        network: nets,
        message: 'load',
        version: packageJson.version,
        randomNumber
    };
    res.send(resp);
    while (true) {
        const a = new Uint32Array(req.params.num);
        const b = new DataView(new ArrayBuffer(req.params.num));
        const a1 = Buffer.from(randomFillSync(a).buffer, a.byteOffset, a.byteLength).toString('hex')
        const b1 = Buffer.from(randomFillSync(b).buffer, b.byteOffset, b.byteLength).toString('hex');
        app.memo_leak = `${app.memo_leak}${a1}${b1}`
        loadCPU(req.params.num)
        console.log('LOAD WAS CALLED');
        await new Promise(resolve => setTimeout(() => resolve(), 1000))
    }
})

app.get('/metrics', async (req, res) => {
    res.end(await register.metrics())
})

app.get('/hc', (req, res) => {
    console.log('hello /hc from console.log');
    res.end('ok')
})

app.listen(3000, () => {
    console.log(`Example app listening at http://localhost:${3000}`);
})
