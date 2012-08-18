var allowSearchByBackgroundImage = false;

function requestSettings() {
  safari.self.tab.dispatchMessage("requestSettings", true);
}

function getSettings(theMessageEvent) {
  if (theMessageEvent.name === "settings") {
    allowSearchByBackgroundImage = theMessageEvent.message;
  }
}

safari.self.addEventListener("message", getSettings, false);


requestSettings();

// allowSearchByBackgroundImage(getSettings);

function handleContextMenu(event) {
  var sendUserInfo = {
    'ifImage': false,
    'imageSrc': ''
  };
  
  if (event.target.nodeName === 'IMG') {
    sendUserInfo.ifImage = true;
    sendUserInfo.imageSrc = event.target.src;
  }
  
  else if (allowSearchByBackgroundImage) {
    var bgImage = getElementsWithBackgroundImage(event.target, event.pageX, event.pageY);
    
    if (bgImage) {
      sendUserInfo.ifImage = true;
      sendUserInfo.imageSrc = bgImage;
    }
  }
  
  safari.self.tab.setContextMenuEventUserInfo(event, sendUserInfo);
}

document.addEventListener("contextmenu", handleContextMenu, false);

function getElementsWithBackgroundImage(element, x, y) {
  if (isElementHaveBackgroundImage(element)) {
    return parseBackgroundImage(element);
  }
  
  else {
    var elementsIntersectingPoint = getElementsIntersectingPoint(
                                      document, x, y, '*', 
                                      isElementHaveBackgroundImage
                                    );
    if (elementsIntersectingPoint.length > 0) {
      return parseBackgroundImage(elementsIntersectingPoint[elementsIntersectingPoint.length-1]);
    }
  }
  
  return false;
}


function isElementHaveBackgroundImage(element) {
  var backgroundImage = getStyle(element, 'backgroundImage');
  return (backgroundImage && backgroundImage !== 'none') ? true : false;
}


function parseBackgroundImage(element) {
  return getStyle(element, 'backgroundImage').replace(/^url\(|\)$/g,'');
}

function getStyle(element, strCssRule){
  var strValue = '';
  
  if (element && document.defaultView && document.defaultView.getComputedStyle){
    var computed = document.defaultView.getComputedStyle(element, '');
    if (computed) {
      strValue = computed[strCssRule];
    }
  }
  
  return strValue;
}

/**
 * http://neverfear.org/blog/view/36/JavaScript_tip_How_to_find_the_document_elements_that_intersect_at_a_certain_coordinate
 *
 * Get the offset coordinates of the element.
 * @param {Object} element The element.
 * @return {Object} An object with four properties named x1, x2, y1 and y2 containing the elements left, right, top and bottom edges respectively.
 */
function getElementPosition(element) {
  var elementX = 0,
      elementY = 0,
      elementW = element.offsetWidth,
      elementH = element.offsetHeight;

  while (element.offsetParent) {
    elementX += element.offsetLeft;
    elementY += element.offsetTop;
    element = element.offsetParent;
  }

  elementX += element.offsetLeft;
  elementY += element.offsetTop;
  elementW += elementX;
  elementH += elementY;

  return {
    x1: elementX,
    y1: elementY,
    x2: elementW,
    y2: elementH
  };
}

/**
 * http://neverfear.org/blog/view/36/JavaScript_tip_How_to_find_the_document_elements_that_intersect_at_a_certain_coordinate
 *
 * Finds all elements that intersects with the given coordinates.
 * @param {Object} doc The document DOM object.
 * @param {Integer} x The X coordinate of the doc.
 * @param {Integer} y The Y coordinate of the doc.
 * @param {String} [tagName] An optional tag name filter.
 * @param {Function} [cmpCallback] A call back function to test whether or not an element should be included in the results (such as testing element id's, values, etc). The call back should return true or false.
 * @return {Array} Returns a primitive array of elements that intersects with point (x, y).
 */
function getElementsIntersectingPoint(doc, x, y, tagName, cmpCallback) {
  var elements = [],
      results = [],
      i = 0,
      element = null,
      pt = null;

  if ( tagName === undefined || tagName === null) {
    tagName = "*";
  }
  if (cmpCallback === undefined || cmpCallback === null) {
    cmpCallback = function (e) {
      return true;
    };
  }

  elements = doc.getElementsByTagName(tagName);

  for (i = 0; i < elements.length; i++) {

    element = elements[i];

    if (cmpCallback(element)) {

      pt = getElementPosition(element);

      if (x >= pt.x1 && x <= pt.x2 && y >= pt.y1 && y <= pt.y2) {
        results[results.length] = element;
        continue;
      }


    }
  }

  return results;
}