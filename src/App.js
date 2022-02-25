import React, { useEffect } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

import './App.css';

const displayImage = async (event) => {
  event.stopPropagation();
  event.preventDefault();

  const file = event.dataTransfer.files[0];
  const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

  try {
    const viewer = event.target;
    cornerstone.enable(viewer);

    const image = await cornerstone.loadImage(imageId);
    const cornerstoneViewport = cornerstone.getDefaultViewportForImage(viewer, image);
    cornerstone.displayImage(viewer, image, cornerstoneViewport);
  } catch(err) {
    console.error(err);
  }
};
const init = () => {
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
};
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
