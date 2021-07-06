# URL Shortener API

#### Project setup 🔧
-   npm install / yarn install
##### Dev 🎬
-   npm  / yarn start
##### Build 🏗️
-   npm run build / yarn run build

---

### 🔚 Routes
- `POST /` -  Create new short url.
##### Example body: 
```
{
	"url": "https://yourlink.com"
}
```
##### Example response:
```
{
	"date": "2021-07-04",
	"originalUrl": "https://yourlink.com",
	"id": "kE4WEp8Dm",
	"shortUrl": "https://shortener.url/kE4WEp8Dm",
	"generatedBy": "60e189de06155500153a48a7"
	"visitors": [],
	"uniqueVisitors: [],
}
```
- `GET /:id` - Redirect to original url and add user to visitors massive
- `GET /statistics/:id` - Returns url information by it's id
- `GET /urls/me` - Returns all my generated urls.


### Whats is definiton of user?
##### User is created by IP Address. if you will generate new link, system will automatically create user with your IP Address, for example if your IP Address is  92.156.133.21, system will generate user like this:
```
{
	"ip": "92.156.133.21",
	"visitedLinks: [],
}
```
### How statistics are generated?
#### When user visits generated url, system does several things.
 1. Finds User IP Address
 2. Looks up for user location by it's IP Address
 3. Parses user-agent header and get's information about what OS and browser is user using
 4. Checks if user is in uniqueVisitors massive.
 5. Redirects user to original URL.

### How many links can service handle?
##### Sevice can handle 20 link per user. User also can remove their generated link and replace it with a new one
