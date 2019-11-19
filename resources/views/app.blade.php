<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Pragma" content="no-cache" />

    <title>{{ config('app.name') }}</title>

    <style>* {padding: 0; margin: 0}</style>

    <link rel="stylesheet" href="{{ mix('dist/css/app.css') }}">

</head>
<body>

<div id="app">
    <app-component />
</div>

<script src="{{ mix('dist/js/app.js') }}"></script>
</body>
</html>
