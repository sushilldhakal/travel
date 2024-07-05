// src/components/Breadcrumbs.js
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const pathnames = pathname.split('/').filter(Boolean);

  const breadcrumbMap = {
    '/dashboard/home': 'Home',
    '/dashboard/tours': 'Tours',
    '/dashboard/users': 'Users',
  };

  const breadcrumbs = pathnames.map((name, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    const breadcrumbName = breadcrumbMap[to];

    return isLast ? (
      <BreadcrumbItem key={to}>
        <BreadcrumbLink>{breadcrumbName}</BreadcrumbLink>
      </BreadcrumbItem>
    ) : (
      <BreadcrumbItem key={to} to={to}>
        <BreadcrumbPage>{breadcrumbName}</BreadcrumbPage>
      </BreadcrumbItem>
    );
  });

  return (
    <nav>
      <Breadcrumb>
        <BreadcrumbList>{breadcrumbs}</BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};


export default Breadcrumbs;

