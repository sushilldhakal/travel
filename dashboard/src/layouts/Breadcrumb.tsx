// src/components/Breadcrumbs.js
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);



  const breadcrumbNameMap = {
    '/dashboard/home': 'Home',
    '/dashboard/tours': 'Tours',
    '/dashboard/users': 'Users',
  };




  return (
    <nav>




<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard/home">Dashboard</BreadcrumbLink>

    </BreadcrumbItem>
   
    <BreadcrumbSeparator />

    {pathnames.map((value, index) => {
const to = `/${pathnames.slice(0, index + 1).join('/')}`;
const isLast = index === pathnames.length - 1;
return isLast ? (
    <BreadcrumbItem  key={to}>
    <BreadcrumbLink> {breadcrumbNameMap[to]}</BreadcrumbLink>
  </BreadcrumbItem>
) : (
    <BreadcrumbItem key={to} to={to}>
    <BreadcrumbPage>{breadcrumbNameMap[to]}</BreadcrumbPage>
  </BreadcrumbItem>

)})}
</BreadcrumbList>
</Breadcrumb>
</nav>
)}


export default Breadcrumbs;

