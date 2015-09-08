# frock-static

A static file server plugin for `frock`, that can source its static files from
interesting places.

A static file source can be:

- A remote URL
- A local directory of files
- A single file

It's important to note that this is not a proxy; it doesn't pass any information
about your request to the data source, nor does it modify the sourced data in
any way.

## `frockfile` Example

In your working directory, create a `frockfile.js`:

```json
{
  "servers": [
    {
      "port": 8080,
      "routes": [
        {
          "path": "/api/people",
          "methods": ["GET"],
          "handler": "frock-static",
          "options": {
            "file": "fixtures/static/people.json",
            "contentType": "application/json"
          }
        },
        {
          "path": "/api/remote",
          "methods": ["GET"],
          "handler": "frock-static",
          "options": {
            "status": 201,
            "url": "http://paste.prod.urbanairship.com/raw/6255",
            "contentType": "application/json"
          }
        },
        {
          "path": "/api/static/*",
          "methods": ["GET"],
          "handler": "frock-static",
          "options": {
            "dir": "fixtures/static/",
            "baseUrl": "/api/static/"
          }
        }
      ]
    }
  ]
}
```

`frock-static` also supports a shorthand syntax, which is convenient for when
you have to define a bunch of static sub-routes:

```json
{
  "servers": [
    {
      "port": 6070,
      "routes": [
        {
          "path": "/api/resources/*",
          "methods": ["GET"],
          "handler": "frock-static",
          "options": {
            "routes": [
              {
                "path": "people",
                "file": "fixtures/static/people.json"
              },
              {
                "path": "places",
                "file": "fixtures/static/places.json"
              },
              {
                "path": "things",
                "url": "https://raw.github.com/someone/something/file.json"
              },
            ],
            "contentType": "application/json"
          }
        }
      ]
    }
  ]
}
```

## License

Apache 2.0, see [LICENSE](./LICENSE) for details.
