<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CmsContent;

class CmsContentController extends Controller
{
    /**
     * Get CMS value by key.
     */
    public function show($key)
    {
        $content = CmsContent::find($key);
        if ($content) {
            return response()->json(json_decode($content->value));
        }
        return response()->json(['error' => 'CMS content not found'], 404);
    }

    /**
     * Store or update CMS content.
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized. Only Administrators can manage CMS content.'], 403);
        }

        $validated = $request->validate([
            'key' => 'required|string',
            'value' => 'required', // can be array or stringified json
        ]);

        $value = is_array($validated['value']) ? json_encode($validated['value']) : $validated['value'];

        $content = CmsContent::updateOrCreate(
            ['key' => $validated['key']],
            ['value' => $value]
        );

        return response()->json([
            'key' => $content->key,
            'value' => json_decode($content->value)
        ]);
    }
}
