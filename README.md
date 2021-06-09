WASM Proxy example
-----------


Build WASM module
```bash
npm install --save-dev assemblyscript
npx asinit .
npm run asbuild
```


Add module to your envoy config
```yaml
	http_filters:
      - name: envoy.filters.http.wasm
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.http.wasm.v3.Wasm
          config:
            name: add_header
            root_id: add_header
            vm_config:
              vm_id: add_header
              runtime: "envoy.wasm.runtime.v8"
              code:
                local:
                  filename: "../build/optimized.wasm"

```


Run Envoy

```bash
brew install envoy
envoy -c proxy.yaml -l debug 
```