import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreadcrumbs } from '@/Provider/BreadcrumbsProvider';

const formatTitle = (segment: string): string => {
  let formatted = segment.replace(/_/g, ' ');
  formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
  return formatted;
};

const GetTitle: React.FC = () => {
  const location = useLocation();
  const { breadcrumbs } = useBreadcrumbs();
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const matchingBreadcrumb = breadcrumbs.find(breadcrumb => breadcrumb.href?.endsWith(lastSegment));
    if (matchingBreadcrumb) {
      setPageTitle(matchingBreadcrumb.label);
    } else {
      setPageTitle(formatTitle(lastSegment));
    }
  }, [breadcrumbs, location.pathname]);

  return <span>{pageTitle}</span>;
}

export default GetTitle;
