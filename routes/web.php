<?php

Route::view('/', 'welcome');

Route::prefix('game')->group(function () {

    Route::view('social', 'game.social')->name('social');

});
