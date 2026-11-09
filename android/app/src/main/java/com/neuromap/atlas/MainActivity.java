package com.neuromap.atlas;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.graphics.Insets;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import androidx.webkit.WebViewAssetLoader;

/** Hosts the Neuromap web atlas, served offline from the APK's assets. */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/www/index.html";
    private static final int BG = Color.rgb(3, 6, 11);

    private WebView web;
    private Object backCallback; // OnBackInvokedCallback on API 33+

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);

        web = new WebView(this);
        web.setBackgroundColor(BG);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);
        // Android 15+ draws apps edge-to-edge: keep the page clear of system bars and cutouts.
        if (Build.VERSION.SDK_INT >= 35) {
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return WindowInsets.CONSUMED;
            });
        }

        // Serve assets over a virtual https origin so ES modules and the
        // import map work exactly as on the web (file:// would block them).
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .setDomain(HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (HOST.equals(uri.getHost())) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (ActivityNotFoundException ignored) {
                    // no browser installed; stay in the app
                }
                return true;
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START_URL);

        // Android 13+: back gestures arrive through OnBackInvokedDispatcher; from
        // Android 16 (target API 36) onBackPressed() is no longer called at all.
        if (Build.VERSION.SDK_INT >= 33) backCallback = Api33.registerBack(this);
    }

    /** Kept in its own class so older devices never load the API 33 types. */
    private static final class Api33 {
        static Object registerBack(MainActivity a) {
            OnBackInvokedCallback cb = a::handleBack;
            a.getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, cb);
            return cb;
        }

        static void unregisterBack(MainActivity a, Object cb) {
            a.getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback((OnBackInvokedCallback) cb);
        }
    }

    /** Android 12 and older. */
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();
    }

    /** Back closes dialogs, the dossier, tours, quiz or micro view before leaving the app. */
    void handleBack() {
        String url = web.getUrl();
        if (url != null && !url.contains("index.html") && web.canGoBack()) {
            web.goBack(); // e.g. returning from the privacy policy page
            return;
        }
        web.evaluateJavascript(
                "(function(){var m=window.__neuromap;"
                        + "var open=[].slice.call(document.querySelectorAll('.modal')).filter(function(x){return !x.hidden;});"
                        + "if(open.length){open[0].hidden=true;return true;}"
                        + "if(document.body.classList.contains('panel-open')){document.body.classList.remove('panel-open');return true;}"
                        + "if(!m)return false;"
                        + "if(m.tours&&m.tours.tour){document.getElementById('tour-exit').click();return true;}"
                        + "if(m.state.quiz){document.getElementById('quiz-exit').click();return true;}"
                        + "if(m.state.selected||!document.getElementById('info').hidden){m.deselect();return true;}"
                        + "if(m.state.scale!=='body'){m.setScale('body');return true;}"
                        + "return false;})()",
                value -> {
                    if (!"true".equals(value)) finish();
                });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (Build.VERSION.SDK_INT >= 33 && backCallback != null) Api33.unregisterBack(this, backCallback);
        web.destroy();
        super.onDestroy();
    }
}
