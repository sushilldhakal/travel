import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItemProps {
  title: string;
  href?: string;
  type?: 'link' | 'page';
}

const generateBreadcrumbItems = (pathname: string): BreadcrumbItemProps[] => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems: BreadcrumbItemProps[] = [];

  pathSegments.forEach((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    //const title = segment.charAt(0).toUpperCase() + segment.slice(1);

    let formatted = segment.replace(/_/g, ' ');
    formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());

    breadcrumbItems.push({
      formatted,
      href,
      type: index < pathSegments.length - 1 ? 'link' : 'page',
    });
  });

  return breadcrumbItems;
};

const Breadcrumbs = () => {
  const location = useLocation();
  const breadcrumbItems = generateBreadcrumbItems(location.pathname);




  return (
    <div>

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.type === 'link' && item.href && (
                  <Link to={item.href}>{item.formatted}</Link>
                )}
                {item.type === 'page' && (
                  <BreadcrumbPage>{item.formatted}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

    </div>

  );
}

export default Breadcrumbs;
