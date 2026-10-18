package dev.erzen.home

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// Everything is laid out on a 960×540 dp stage; MainActivity scales density so 1 dp = 2 px on 1080p.
val ICON_W = 156.dp
val ICON_H = 94.dp
private val GAP = 24.dp
val EDGE = 42.dp
private val ROW_H = 132.dp
private const val TOP_ROW_Y = 376f
val ICON_SHAPE = RoundedCornerShape(11.dp)

@Composable
fun HomeScreen(s: HomeState) {
    val focusRequester = remember { FocusRequester() }
    Box(
        Modifier
            .fillMaxSize()
            .background(Color.Black)
            .onPreviewKeyEvent { s.onKey(it.nativeKeyEvent) }
            .focusRequester(focusRequester)
            .focusable()
    ) {
        Hero(s)
        ShelfText(s)
        Grid(s)
        StatusBar(s)

        AnimatedVisibility(s.mode == Mode.Sheet, enter = fadeIn(tween(220)), exit = fadeOut(tween(180))) { ActionSheet(s) }
        AnimatedVisibility(s.mode == Mode.Control, enter = fadeIn(tween(180)), exit = fadeOut(tween(160))) { ControlCenter(s) }
        AnimatedVisibility(s.mode == Mode.Settings || s.mode == Mode.CityInput, enter = fadeIn(tween(260)), exit = fadeOut(tween(200))) { SettingsScreen(s) }
        if (s.mode == Mode.CityInput) CityDialog(s)
        AnimatedVisibility(s.mode == Mode.Saver, enter = fadeIn(tween(1800)), exit = fadeOut(tween(450))) { Aerial(s) }
        Toast(s)
    }

    LaunchedEffect(s.mode == Mode.CityInput) { if (s.mode != Mode.CityInput) runCatching { focusRequester.requestFocus() } }

    // screensaver timer
    LaunchedEffect(s.lastInput, s.saverMinutes, s.mode) {
        if ((s.mode == Mode.Home || s.mode == Mode.Shelf) && s.saverMinutes > 0) {
            delay(s.saverMinutes * 60_000L)
            s.startSaver()
        }
    }
    // the Top Shelf carousel turns its own pages, like tvOS
    LaunchedEffect(s.slideTick, s.slide, s.mode, s.focus < COLS) {
        if ((s.mode == Mode.Home && s.focus < COLS) || s.mode == Mode.Shelf) {
            delay(9_000)
            s.nextSlide()
        }
    }
}

// ---------------------------------------------------------------------------- Hero / Top Shelf backdrop
@Composable
private fun Hero(s: HomeState) {
    val slide = s.currentSlide
    val photo = slide?.photo ?: 0
    val overlay = s.mode == Mode.Sheet || s.mode == Mode.Control || s.mode == Mode.Settings || s.mode == Mode.CityInput
    val blurA = animateFloatAsState(if (s.gridMode || overlay) 1f else 0f, tween(550, easing = FastOutSlowInEasing), label = "blur")
    val dimA = animateFloatAsState(
        when {
            s.mode == Mode.Settings || s.mode == Mode.CityInput -> .62f
            overlay -> .42f
            s.gridMode -> .28f
            else -> 0f
        }, tween(450), label = "dim",
    )

    Box(Modifier.fillMaxSize()) {
        if (s.photoShelf) {
            Crossfade(photo, animationSpec = tween(900, easing = FastOutSlowInEasing), label = "hero") { p -> KenBurns(p, s.calm) }
            Crossfade(photo, Modifier.graphicsLayer { alpha = blurA.value }, animationSpec = tween(900), label = "heroBlur") { p ->
                rememberBlurredPhoto(p)?.let { Image(it, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop, filterQuality = FilterQuality.Low) }
            }
        } else {
            ColourShelf(s)
        }
        // scrims that keep text and icons readable on bright photos
        Box(Modifier.fillMaxSize().graphicsLayer { alpha = 1f - blurA.value }.drawWithContent {
            drawRect(Brush.horizontalGradient(0f to Color.Black.copy(.62f), .38f to Color.Black.copy(.22f), .62f to Color.Transparent))
            drawRect(Brush.verticalGradient(0f to Color.Black.copy(.32f), .16f to Color.Transparent, .5f to Color.Transparent, .78f to Color.Black.copy(.28f), 1f to Color.Black.copy(.72f)))
        })
        Box(Modifier.fillMaxSize().graphicsLayer { alpha = dimA.value }.background(Color.Black))
    }
}

/** A photo with a slow, continuous zoom and drift (the "Ken Burns" effect). */
@Composable
fun KenBurns(p: Int, calm: Boolean, durationMs: Int = 26_000, from: Float = 1.02f, to: Float = 1.1f, pan: Float = 18f) {
    val img = rememberPhoto(p) ?: return
    val t = rememberInfiniteTransition(label = "kb").animateFloat(0f, 1f, infiniteRepeatable(tween(durationMs, easing = LinearEasing), RepeatMode.Reverse), label = "kbt")
    Image(
        img, null,
        Modifier.fillMaxSize().graphicsLayer {
            val k = if (calm) 1f else t.value
            val sc = from + (to - from) * k
            scaleX = sc; scaleY = sc
            translationX = (k - .5f) * pan.dp.toPx()
        },
        contentScale = ContentScale.Crop,
    )
}

@Composable
private fun ColourShelf(s: HomeState) {
    val pal = s.colorPalette()
    val spec = tween<Color>(900)
    val c1 = animateColorAsState(pal[0], spec, label = "c1")
    val c2 = animateColorAsState(pal[1], spec, label = "c2")
    val c3 = animateColorAsState(pal[2], spec, label = "c3")
    val c4 = animateColorAsState(pal[3], spec, label = "c4")
    Canvas(Modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height
        drawRect(Brush.radialGradient(listOf(c2.value, c1.value, Color.Black), Offset(w * .7f, h * .3f), w * 1.05f))
        drawCircle(Brush.radialGradient(listOf(c3.value.copy(.85f), Color.Transparent), Offset(w * .75f, h * .15f), w * .4f), w * .4f, Offset(w * .75f, h * .15f))
        drawCircle(Brush.radialGradient(listOf(c4.value.copy(.55f), Color.Transparent), Offset(w * .85f, h * .85f), w * .3f), w * .3f, Offset(w * .85f, h * .85f))
    }
}

// ---------------------------------------------------------------------------- Top Shelf text & buttons
@Composable
private fun ShelfText(s: HomeState) {
    val expanded = s.mode == Mode.Shelf
    val visible = (s.mode == Mode.Home || s.mode == Mode.Shelf || s.mode == Mode.Jiggle) && !s.gridMode && s.loaded
    val a = animateFloatAsState(if (visible) 1f else 0f, tween(if (visible) 500 else 250), label = "sa")
    val drop = animateFloatAsState(if (expanded) 1f else 0f, spring(.85f, Spring.StiffnessLow), label = "drop")
    val app = s.shelfApp
    val slide = s.currentSlide

    Box(Modifier.fillMaxSize().graphicsLayer { alpha = a.value }) {
        Column(
            Modifier
                .align(Alignment.BottomStart)
                .padding(start = EDGE + 4.dp, bottom = 200.dp)
                .width(600.dp)
                .graphicsLayer {
                    translationY = drop.value * 112.dp.toPx()
                    val k = 1f + drop.value * .12f
                    scaleX = k; scaleY = k
                    transformOrigin = TransformOrigin(0f, 1f)
                }
        ) {
            AnimatedContent(
                targetState = (app?.key ?: "") to slide,
                transitionSpec = { (fadeIn(tween(500, 120)) + slideInHorizontally(tween(600, 120, FastOutSlowInEasing)) { it / 18 }) togetherWith fadeOut(tween(220)) },
                contentKey = { it.first + (it.second?.title ?: "") },
                label = "shelfText",
            ) { (_, sl) ->
                if (sl == null) return@AnimatedContent
                Column {
                    BasicText(sl.kicker, style = style(12f, FontWeight.SemiBold, Ink.secondary, .14f))
                    Spacer(Modifier.height(7.dp))
                    BasicText(sl.title, style = style(44f, FontWeight.ExtraBold, tracking = -.025f, display = true, lineHeight = 48f), maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Spacer(Modifier.height(9.dp))
                    BasicText(sl.body, Modifier.width(470.dp), style = style(15f, FontWeight.Medium, Ink.secondary, lineHeight = 21f), maxLines = 2, overflow = TextOverflow.Ellipsis)
                }
            }
            Spacer(Modifier.height(14.dp))
            PageDots(s.slides.size, s.slide.mod(s.slides.size.coerceAtLeast(1)))
        }

        // buttons appear when you move up into the Top Shelf
        val b = animateFloatAsState(if (expanded) 1f else 0f, tween(if (expanded) 380 else 160, if (expanded) 140 else 0), label = "btn")
        Row(
            Modifier.offset(EDGE + 4.dp, 466.dp).graphicsLayer { alpha = b.value; translationY = (1 - b.value) * 16.dp.toPx() },
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Pill("Open ${app?.label ?: ""}", "play", expanded && s.shelfButton == 0)
            Pill(null, "dots", expanded && s.shelfButton == 1)
        }
        val hint = animateFloatAsState(if (expanded) 1f else 0f, tween(300, 500), label = "hint")
        BasicText(
            "▲  Control Center",
            Modifier.align(Alignment.TopCenter).padding(top = 22.dp).graphicsLayer { alpha = hint.value * .9f },
            style = style(12f, FontWeight.SemiBold, Ink.tertiary, .04f),
        )
    }
}

@Composable
fun PageDots(n: Int, current: Int) {
    if (n <= 1) return
    Row(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalAlignment = Alignment.CenterVertically) {
        repeat(n) { k ->
            val on = k == current
            val w = animateDpAsState(if (on) 18.dp else 6.dp, spring(.8f, Spring.StiffnessMediumLow), label = "dw")
            val c = animateColorAsState(if (on) Color.White else Color.White.copy(.38f), tween(300), label = "dc")
            Box(Modifier.size(w.value, 6.dp).background(c.value, RoundedCornerShape(50)))
        }
    }
}

/** tvOS-style capsule button: frosted when idle, white and lifted when focused. */
@Composable
fun Pill(label: String?, glyph: String?, focused: Boolean, danger: Boolean = false, modifier: Modifier = Modifier, height: Float = 42f, onClick: (() -> Unit)? = null) {
    val k = animateFloatAsState(if (focused) 1.09f else 1f, spring(.6f, Spring.StiffnessMedium), label = "pk")
    val bg = animateColorAsState(if (focused) Color.White else Color.White.copy(.17f), tween(180), label = "pbg")
    val fg = when {
        danger -> Ink.red
        focused -> Ink.dark
        else -> Color.White
    }
    Row(
        modifier
            .height(height.dp)
            .graphicsLayer {
                scaleX = k.value; scaleY = k.value
                shadowElevation = if (focused) 18.dp.toPx() else 0f
                shape = RoundedCornerShape(50)
            }
            .background(bg.value, RoundedCornerShape(50))
            .then(if (onClick != null) Modifier.clickable(remember { MutableInteractionSource() }, null, onClick = onClick) else Modifier)
            .padding(horizontal = if (label == null) 15.dp else 22.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        if (glyph != null) Glyph(glyph, fg, Modifier.size(15.dp))
        if (glyph != null && label != null) Spacer(Modifier.width(9.dp))
        if (label != null) BasicText(label, style = style(16f, FontWeight.SemiBold, fg), maxLines = 1)
    }
}

// ---------------------------------------------------------------------------- Status (clock, weather)
@Composable
private fun StatusBar(s: HomeState) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) { while (true) { now = System.currentTimeMillis(); delay(60_000L - now % 60_000L + 50) } }
    val show = s.showClock && (s.mode == Mode.Home || s.mode == Mode.Shelf || s.mode == Mode.Jiggle || s.mode == Mode.Sheet)
    val a = animateFloatAsState(if (show) 1f else 0f, tween(300), label = "status")
    Row(
        Modifier.fillMaxWidth().padding(top = 24.dp, end = EDGE + 4.dp).graphicsLayer { alpha = a.value },
        horizontalArrangement = Arrangement.End,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        s.weather?.let { w ->
            WeatherIcon(Weather.kind(w.code), Modifier.size(19.dp), Ink.secondary)
            Spacer(Modifier.width(6.dp))
            BasicText("${w.temp}°", style = style(18f, FontWeight.SemiBold, Ink.secondary))
            Spacer(Modifier.width(16.dp))
        }
        BasicText(clock(now, s.clock24), style = style(18f, FontWeight.SemiBold))
    }
}

fun clock(t: Long, h24: Boolean): String = SimpleDateFormat(if (h24) "HH:mm" else "h:mm", Locale.getDefault()).format(Date(t))

// ---------------------------------------------------------------------------- App grid
@Composable
private fun Grid(s: HomeState) {
    val row = s.focus / COLS
    val target = when {
        s.mode == Mode.Shelf -> 200f
        s.gridMode || (s.mode != Mode.Home && s.mode != Mode.Jiggle && row > 0) -> 196f - TOP_ROW_Y - row * 132f
        else -> 0f
    }
    val scroll = animateFloatAsState(target, spring(.86f, Spring.StiffnessLow), label = "scroll")
    val boot = animateFloatAsState(if (s.loaded) 1f else 0f, tween(900, easing = FastOutSlowInEasing), label = "boot")
    val fade = animateFloatAsState(
        when (s.mode) {
            Mode.Settings, Mode.CityInput, Mode.Saver, Mode.Sheet -> 0f
            Mode.Control -> .3f
            else -> 1f
        }, tween(300), label = "gridFade",
    )

    Box(Modifier.fillMaxSize().graphicsLayer {
        translationY = scroll.value.dp.toPx() + (1 - boot.value) * 60.dp.toPx()
        alpha = boot.value * fade.value
    }) {
        s.apps.forEachIndexed { i, app ->
            val r = i / COLS
            if (r < row - 3 || r > row + 4) return@forEachIndexed
            key(app.key) {
                Box(Modifier.offset(EDGE + (ICON_W + GAP) * (i % COLS), TOP_ROW_Y.dp + ROW_H * r)) { Tile(s, i, app) }
            }
        }
    }
}

@Composable
private fun Tile(s: HomeState, i: Int, app: AppEntry) {
    val focused = i == s.focus && (s.mode == Mode.Home || s.mode == Mode.Jiggle || s.mode == Mode.Sheet)
    val jiggling = focused && s.mode == Mode.Jiggle
    val v = s.visuals[app.key]

    val scale = animateFloatAsState(if (focused) 1.17f else 1f, spring(.62f, 340f), label = "scale")
    val lift = animateFloatAsState(if (focused) 1f else 0f, tween(if (focused) 240 else 180), label = "lift")

    // parallax tilt: the icon leans toward the direction focus came from, then settles with a wobble
    val tiltX = remember { Animatable(0f) }
    val tiltY = remember { Animatable(0f) }
    LaunchedEffect(focused, s.moveTick) {
        if (focused && !s.calm) {
            val (ry, rx) = when (s.lastDir) { Dir.Right -> -10f to 0f; Dir.Left -> 10f to 0f; Dir.Down -> 0f to 9f; Dir.Up -> 0f to -9f }
            tiltY.snapTo(ry); tiltX.snapTo(rx)
            launch { tiltY.animateTo(0f, spring(.32f, 220f)) }
            tiltX.animateTo(0f, spring(.32f, 220f))
        }
    }
    // edge bump
    val bump = remember { Animatable(0f) }
    LaunchedEffect(s.bumpTick) {
        if (focused && s.bumpTick > 0) {
            bump.snapTo(0f)
            bump.animateTo(1f, tween(90, easing = FastOutSlowInEasing))
            bump.animateTo(0f, spring(.35f, 500f))
        }
    }
    val jig = if (jiggling) rememberInfiniteTransition(label = "jig").animateFloat(-1.7f, 1.7f, infiniteRepeatable(tween(130), RepeatMode.Reverse), label = "jr") else null
    val bootDelay = remember { Animatable(0f) }
    LaunchedEffect(s.loaded) { if (s.loaded) { delay(60L * i.coerceAtMost(10)); bootDelay.animateTo(1f, spring(.75f, Spring.StiffnessLow)) } }

    Box(
        Modifier
            .size(ICON_W, ICON_H)
            .onGloballyPositioned { s.tileBounds[app.key] = it.boundsInWindow() }
            .graphicsLayer {
                val b = bump.value * 9.dp.toPx()
                scaleX = scale.value; scaleY = scale.value
                rotationY = tiltY.value
                rotationX = tiltX.value
                rotationZ = jig?.value ?: 0f
                cameraDistance = 14f * density
                translationX = when (s.bumpDir) { Dir.Left -> -b; Dir.Right -> b; else -> 0f }
                translationY = when (s.bumpDir) { Dir.Up -> -b; Dir.Down -> b * .6f; else -> 0f } - lift.value * 3.dp.toPx() + (1 - bootDelay.value) * 30.dp.toPx()
                alpha = bootDelay.value
                shadowElevation = lift.value * 34.dp.toPx() + 3.dp.toPx()
                ambientShadowColor = Color.Black
                spotShadowColor = Color.Black
                shape = ICON_SHAPE
                clip = true
            }
            .clickable(remember { MutableInteractionSource() }, null) { if (s.mode == Mode.Home) s.activate(i) }
            .drawWithContent {
                drawContent()
                // glass: soft top sheen, a light rim, and a glare that slides opposite the tilt
                drawRect(Brush.verticalGradient(0f to Color.White.copy(.14f), .5f to Color.Transparent))
                if (lift.value > 0f) {
                    val gx = size.width * (.5f - tiltY.value / 22f)
                    val gy = size.height * (.08f + tiltX.value / 30f)
                    val r = size.width * .7f
                    drawCircle(Brush.radialGradient(listOf(Color.White.copy(.30f * lift.value), Color.Transparent), Offset(gx, gy), r), r, Offset(gx, gy))
                }
                drawRoundRect(
                    Brush.verticalGradient(listOf(Color.White.copy(.38f), Color.White.copy(.06f), Color.White.copy(.12f))),
                    cornerRadius = CornerRadius(11.dp.toPx()), style = Stroke(1.dp.toPx()),
                )
            }
    ) { TileFace(app, v) }

    BasicText(
        app.label,
        Modifier.width(ICON_W + 40.dp).offset(x = (-20).dp, y = ICON_H + 17.dp).graphicsLayer { alpha = lift.value; translationY = (1 - lift.value) * -5.dp.toPx() },
        style = style(14.5f, FontWeight.SemiBold).copy(textAlign = TextAlign.Center, shadow = Shadow(Color.Black.copy(.5f), Offset(0f, 2f), 8f)),
        maxLines = 1, overflow = TextOverflow.Ellipsis,
    )
}

@Composable
fun TileFace(app: AppEntry, v: AppVisual?, modifier: Modifier = Modifier.fillMaxSize(), glyphScale: Float = 1f) {
    val a = v?.a ?: Color(0xFF3A3A3C)
    val b = v?.b ?: Color(0xFF1C1C1E)
    Box(modifier.background(Brush.linearGradient(listOf(a, b), Offset.Zero, Offset(0f, Float.POSITIVE_INFINITY))), contentAlignment = Alignment.Center) {
        when {
            app.key == SETTINGS_KEY -> Glyph("gear", Color(0xFF5B5B61), Modifier.fillMaxHeight(.56f * glyphScale).aspectRatio(1f))
            v?.banner != null -> Image(v.banner, app.label, Modifier.fillMaxSize(), contentScale = ContentScale.Crop, filterQuality = FilterQuality.Medium)
            v?.icon != null -> {
                Box(Modifier.fillMaxSize().background(Brush.radialGradient(listOf(Color.White.copy(.22f), Color.Transparent), Offset(0f, 0f), 900f)))
                Image(v.icon, app.label, Modifier.fillMaxHeight(.62f * glyphScale).aspectRatio(1f), contentScale = ContentScale.Fit, filterQuality = FilterQuality.Medium)
            }
            else -> BasicText(app.label.take(1).uppercase(), style = style(30f, FontWeight.Bold, Ink.secondary, display = true))
        }
    }
}
