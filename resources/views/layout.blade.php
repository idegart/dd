<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name') }}</title>

    <link rel="stylesheet" href="{{ mix('dist/css/app.css') }}">

    @yield('header')

</head>
<body>

<div id="app">
    @yield('app')
</div>

<script src="{{ mix('dist/js/app.js') }}"></script>

@yield('footer')

</body>
</html>
