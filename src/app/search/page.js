"use client"
import PropertyList from "./components/PropertyList";

export default function Search() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Find Your Perfect Property</h1>
        <PropertyList/>
      </div>
    </div>
  );
}
