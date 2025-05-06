import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from '@/Provider/BreadcrumbsProvider';
import { Breadcrumb as BreadcrumbType } from '@/Provider/types';



const generateBreadcrumbItems = (pathname: string): BreadcrumbType[] => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems: BreadcrumbType[] = [];

  pathSegments.forEach((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    let title = segment.replace(/_/g, ' ');
    title = title.replace(/\b\w/g, char => char.toUpperCase());

    breadcrumbItems.push({
      label: title,
      href,
      type: index < pathSegments.length - 1 ? 'link' : 'page',
    });
  });

  return breadcrumbItems;
};

const Breadcrumbs = () => {
  const location = useLocation();
  const { breadcrumbs, updateBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    const newBreadcrumbs = generateBreadcrumbItems(location.pathname).map(item => ({
      ...item,
      label: item.label
    }));
    updateBreadcrumbs(newBreadcrumbs);
  }, [location.pathname, updateBreadcrumbs]);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.type === 'link' && item.href && (
                  <Link to={item.href}>{item.label}</Link>
                )}
                {item.type === 'page' && (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
