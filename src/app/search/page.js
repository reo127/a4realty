"use client"
import { Suspense } from "react";
import Footer from "../components/Footer";
import PropertyList from "./components/PropertyList";

function SearchFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading search results...</p>
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Find Your Perfect Property</h1>
        <Suspense fallback={<SearchFallback />}>
          <PropertyList/>
        </Suspense>
        <Footer/>
      </div>
    </div>
  );
}
