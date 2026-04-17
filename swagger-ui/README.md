# Swagger UI Static Docs

A) Static HTML (CDN assets)
Open index.html. Requires internet to load Swagger UI JS/CSS.

B) Docker (self-contained)
docker run --rm -p 8080:8080 \
  -e SWAGGER_JSON=/spec/openapi.yaml \
  -v "$(pwd)/../openapi/taradome-openapi-v1.yaml:/spec/openapi.yaml" \
  swaggerapi/swagger-ui
Then open http://localhost:8080
