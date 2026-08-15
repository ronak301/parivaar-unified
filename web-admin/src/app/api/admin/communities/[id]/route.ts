import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/communities/${id}`, {
      headers: {
        'Authorization': 'Bearer dev-token',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
      }
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, community: data.community });
  } catch (e) {
    console.error('Failed to fetch community:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load community' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/communities/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer dev-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, community: data.community });
  } catch (e) {
    console.error('Failed to update community:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update community' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/communities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer dev-token',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Failed to delete community:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to delete community' },
      { status: 500 }
    );
  }
}
