# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod ./
RUN go mod download github.com/pocketbase/pocketbase

COPY . .

RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /pocketbase main.go

# Runtime stage
FROM alpine:3.19

WORKDIR /

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /pocketbase /pocketbase
COPY pb_migrations /pb_data/pb_migrations

EXPOSE 8090

CMD ["/pocketbase", "serve", "--http=0.0.0.0:8090"]
