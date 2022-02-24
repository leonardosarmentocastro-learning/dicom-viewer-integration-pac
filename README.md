# dicom-viewer-integration-pac

Training project for teaching the basics around connecting a dicom viewer with a PAC (DCM4CHEE).

## Progress checklist

1. [x] Configure and run [DCM4CHEE using docker-compose](https://github.com/dcm4che/dcm4chee-arc-light/wiki/Run-minimum-set-of-archive-services-on-a-single-host#use-docker-compose)
2. [] Add a viewport (cornerstone + cornerstone-tools) with an empty toolbar (no tools included), alongside a "download image" button (https://files.slack.com/files-pri/T03V6M5QV-F02RJAR1VQQ/image.png)
3. [] Connect the viewer (cornerstone) with PAC (DCM4CHEE) using [`cornerstone-wado-image-loader`](https://www.npmjs.com/package/cornerstone-wado-image-loader)
4. [] On button click, download a DICOM file from PAC and display it on dicom viewer
5. [] Once DICOM file is displayed, renders the file overlay tag (6000) on viewport

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run docker:start`

Start all 3 containers (`ldap`, `db` and `arc`) using the configuration specified at `docker-compose.yml`, and the environment variables from `docker-compose.env`.

### `npm run docker:stop`

Stop all 3 containers (`ldap`, `db` and `arc`).

### `npm run docker:down`

Stop and delete all 3 containers (`ldap`, `db` and `arc`).
