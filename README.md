# Capstone Project for Dicoding Backend - Intermediate level

### Architecture:

![Alt text](doc/images/Architecture.png?raw=true 'Architecture')

### ERD:

![Alt text](doc/images/ERD.png?raw=true 'ERD')

### List of Services:

- SongsService: To manage songs resources
- UsersService: To manage users resources
- AuthenticationsService: To manage accessToken and refreshToken for users
- PlaylistsService: To manage playlist resources created by users
- CollaborationsService: To manage users collaborations on playlists
- ExportsService: To manage playlist exports to users email, using message broker, ProducerService, and ConsumerService
- CacheService: To manage server-side caching (to reduce db access) by using in memory database
- StorageService: To manage image uploaded by users

### API Testing Scenarios: /postman_test

- OpenMusicAPITest.postman_environment to set Postman environment variable
- OpenMusicAPITest.postman_collection to start testing
- File upload tests need to be done manually
