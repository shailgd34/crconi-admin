import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0 overflow-hidden">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0 overflow-hidden">
        {children}
        <div
          className="items-center hidden w-full h-full lg:w-1/2 lg:grid lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg"
          style={{ backgroundImage: "url('/images/bgsignin.jpg')" }}
        >
          <div className="relative flex items-center justify-center z-1 w-full h-full pb-24">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-4">
                <img
                  width={200}
                  height={50}
                  src="/images/logo/crconidigital.png"
                  alt="Croconi Digital Admin"
                />
              </Link>
              <p className="text-center text-brand-900 dark:text-gray-300 text-sm font-medium">
                Croconi Digital Admin - Modern & Powerful Admin Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
