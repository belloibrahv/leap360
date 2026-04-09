/**
 * Permission Demo Page
 * 
 * Demonstrates the new role-based permission system.
 */

"use client";

import React from 'react';
import { PermissionDemo } from '@/components/demo/PermissionDemo';

export default function PermissionDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PermissionDemo />
      </div>
    </div>
  );
}