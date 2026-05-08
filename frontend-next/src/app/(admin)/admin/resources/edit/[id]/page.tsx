'use client';

import { useParams } from 'next/navigation';
import ResourceEditorPage from '@/components/resources/shared/ResourceEditorPage';

export default function AdminEditResourcePage() {
  const params = useParams();

  return (
    <ResourceEditorPage
      mode="edit"
      resourceId={params.id as string}
      redirectPath="/admin/resources"
    />
  );
}
