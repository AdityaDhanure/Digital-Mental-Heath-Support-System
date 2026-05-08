'use client';

import ResourceEditorPage from '@/components/resources/shared/ResourceEditorPage';

export default function AdminAddResourcePage() {
  return <ResourceEditorPage mode="add" redirectPath="/admin/resources" />;
}
