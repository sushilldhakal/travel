import React from 'react';
import { useLocation } from 'react-router-dom';

const formatTitle = (segment) => {
  let formatted = segment.replace(/_/g, ' ');
  formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
  return formatted;
};
const GetTitle = () => {

    const location = useLocation();
    const urlPath = location.pathname;
    const urlSegments = urlPath.split('/');
    const lastSegment = urlSegments[urlSegments.length - 1];
    const formattedTitle = formatTitle(lastSegment);

  return formattedTitle
}

export default GetTitle