"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import "./Breadcrumb.css";

interface BreadcrumbLink {
  name: string;
  href: string;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname?.slice(1).split("/");

  const breadcrumbLinks: BreadcrumbLink[] = paths?.reduce((acc: BreadcrumbLink[], path, index) => {
    const href = `${acc.length > 0 ? acc[index - 1].href : ""}/${path}`;
    acc.push({ name: path, href });
    return acc;
  }, []);

  const logout = async () => {
    await fetch("/api/session", {
      method: "DELETE",
    });
  };

  return (
    <div className="breadcrumb">
      <div>
        <Link href="/">Home/</Link>
        {breadcrumbLinks?.map((breadcrumb, index) => (
          <Link key={index} href={breadcrumb.href}>
            {breadcrumb.name}/
          </Link>
        ))}
      </div>

      {pathname !== "/admin/login" && pathname !== "/admin/register" && (
        <Link href="/admin/login" onClick={logout}>
          Logout
        </Link>
      )}
    </div>
  );
}
