import React, { useEffect } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

import './App.css';

const displayImage = async (event) => {
  event.stopPropagation();
  event.preventDefault();

  // One of the WADO Protocol requirements for sharing DICOM through web is the "wadouri" (https://dicom.nema.org/dicom/2013/output/chtml/part18/chapter_6.html).
  // In this example, DICOM files are being fetched from the local file system instead of a DICOM server.
  // Each image is identified by an ID, also known as `imageId`, and will be later used by `cornerstone` for displaying the image.
  // https://github.com/cornerstonejs/cornerstone/blob/650ba0c76475f765088cbf929d12a79dfc25a4f2/docs/concepts/image-ids.md
  //
  // The `imageId` is important because it stores information of which `image-loader` plugin to use, and where to find the image (the address, per say).
  // The `image-loader` attached for this example has a simplistic `fileManager` implementation that creates an `imageId` specifying "dicomfile" as the image loading strategy.
  // https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/e38c066a7b8c293e48b6e0ca7a21791400ce7d86/src/imageLoader/wadouri/fileManager.js#L3
  // 
  // When the `image-loader` is attached to cornerstone, it registers an image loading strategy for an specific `imageId` keyword, in this case, "dicomfile":
  // https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/e38c066a7b8c293e48b6e0ca7a21791400ce7d86/src/imageLoader/wadouri/register.js#L8
  // https://github.com/cornerstonejs/cornerstone/blob/650ba0c76475f765088cbf929d12a79dfc25a4f2/src/imageLoader.js#L119
  const file = event.dataTransfer.files[0];
  const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

  try {
    // Before displaying the image, the interactive area where it will be displayed (typically a <div> or anything with a height and width set), must be prepared.
    // This interactive area is a canvas, that contains auxiliar properties for managing the image draw/redraw lifecycle. It's also known as "enabled elements":
    // https://github.com/cornerstonejs/cornerstone/blob/747a0c6bd1a130c2e2f400c5c39b02e859f3531f/docs/concepts/enabled-elements.md
    // https://github.com/cornerstonejs/cornerstone/blob/ca3a99228856cef1fff263c4407d0bb2a0079a49/src/enabledElements.js#L106
    // https://github.com/cornerstonejs/cornerstone/blob/ca3a99228856cef1fff263c4407d0bb2a0079a49/src/enable.js#L59
    // 
    // The "enabled element" receives the css class `cornerstone-canvas` as an auxiliar helping identifier.
    const interactiveArea = event.target;
    cornerstone.enable(interactiveArea);

    // 1. Once `cornerstone` decides to load an image of a given ID, it identifies which loader to use (based on `imageId` plugin name reference before ":" column)
    // https://github.com/cornerstonejs/cornerstone/blob/650ba0c76475f765088cbf929d12a79dfc25a4f2/src/imageLoader.js#L30
    // and invokes the loader `loadImage` strategy, which will always return an `imageLoadObject`, containing a promise that resolves for the real picture:
    // https://github.com/cornerstonejs/cornerstone/blob/8488a602f41ca36eb834735f08b2f6ed49c25648/test/imageCache_test.js#L52
    // 
    // 2. As the interactive area is enabled to receive images and the image promise is ready, it's time to prepare the virtual camera which will glue both together.
    // The virtual camera is also known as "viewport", and takes many image's dicom file information in consideration to construct it, as they will later be used to change the way it's displayed for doctors (e.g. windowing):
    // - QUESTION/FIND OUT: at which moment "windowCenter" is attached to the `image` object used in `getDefaultViewport`?
    // https://github.com/cornerstonejs/cornerstone/blob/747a0c6bd1a130c2e2f400c5c39b02e859f3531f/src/internal/getDefaultViewport.js#L24
    // https://radiopaedia.org/articles/windowing-ct
    // 
    // 3. Finally, with the interactive area + virtual camera prepared and the image loaded, it's time to display (draw) it.
    // QUESTION/FIND OUT: how the redraw lifecycle works?
    const imageLoadObject = await cornerstone.loadImage(imageId); // 1
    const cornerstoneViewport = cornerstone.getDefaultViewportForImage(interactiveArea, imageLoadObject); // 2
    cornerstone.displayImage(interactiveArea, imageLoadObject, cornerstoneViewport);
  } catch(err) {
    console.error(err);
  }
};

// The `cornerstone` by itself doesn't have all the pieces for the puzzle (of loading, interpreting and displaying dicom file's images), so we must manually attach them.
// The two fundamental pieces are the "image loader" and "dicom-parser".
// > 1. The `image-loader` is responsible for loading pixel data from DICOM files that are fetched from an "image provider" (a web server or a file system).
// https://github.com/cornerstonejs/cornerstone/blob/650ba0c76475f765088cbf929d12a79dfc25a4f2/docs/concepts/image-loaders.md#image-loader-workflow
// >
// > It act's as the bridge between `cornerstone` and the "image provider".
// https://github.com/cornerstonejs/cornerstone/blob/650ba0c76475f765088cbf929d12a79dfc25a4f2/docs/concepts/image-loaders.md#writing-an-image-loader
// >
// > 2. The `dicom-parser` is responsible for reading the different byte streams of a DICOM file (tags) and translating it into an serializable object (JSON).
// > https://github.com/cornerstonejs/dicomParser#usage
const init = () => {
  // > WADO stands for "Web Access to Dicom Objects", it's a protocol that server as a vehicle for obtaining DICOM files through the internet.
  // It's usually complemented by the suffix "RS", which indicates it also contains RESTful protocol implementation for querying files.
  // To use WADO protocol, it's necessary to have a DICOM viewer that implements it. That's where cornerstone enters the game.
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

  // Since cornerstone was built to encourage developers to not restrict themselves when choosing which tools to use, it's necessary
  // to plug in all small bits used during the translation of a DICOM file. That's where the "dicomParser" fills the gap.
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
};

// TODO: integrate with a DICOM server.
// const loadImage = (event) => {
  // https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/master/test/integration_test.js
  // https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/master/test/imageLoader/wadouri/metaDataProvider_test.js
  // it seems like the image loader expects a filename containing the URL/imageid for the file
  // const base = 'CTImage.dcm';
  // const url = 'dicomweb://localhost:9876/base/testImages/';
  // const name = transferSyntaxes[transferSyntaxUid];
  // const filename = `${base}_${name}_${transferSyntaxUid}.dcm`
// };
const stopEvent = (event) => {
  event.stopPropagation();
  event.preventDefault();
};

function App() {
  useEffect(() => {
    init();
  }, []);

  return (
    <div className="App">
      <div className='toolbar'></div>

      <main
        id='viewport'
        onDragOver={stopEvent}
        onDrop={displayImage}
      />

      <div className='buttons'>
        <button>Load image</button>
      </div>
    </div>
  );
}

export default App;
