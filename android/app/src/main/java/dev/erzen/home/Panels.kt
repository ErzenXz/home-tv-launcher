package dev.erzen.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.random.Random

/** Springs a panel in from slightly smaller, like tvOS sheets. */
@Composable
private fun SpringIn(from: Float = .9f, originX: Float = .5f, originY: Float = .5f, content: @Composable () -> Unit) {
    val p = remember { Animatable(0f) }
    LaunchedEffect(Unit) { p.animateTo(1f, spring(.72f, Spring.StiffnessMediumLow)) }
    Box(Modifier.graphicsLayer {
        val k = from + (1 - from) * p.value
        scaleX = k; scaleY = k
        alpha = p.value.coerceIn(0f, 1f)
        transformOrigin = TransformOrigin(originX, originY)
    }) { content() }
}

// ---------------------------------------------------------------------------- Action sheet (≡ / Play-Pause)
@Composable
fun ActionSheet(s: HomeState) {
    val app = s.sheetApp ?: return
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        SpringIn {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(ICON_W * 1.25f, ICON_H * 1.25f).graphicsLayer { shadowElevation = 30.dp.toPx(); shape = ICON_SHAPE; clip = true }) {
                    TileFace(app, s.visuals[app.key])
                }
                Spacer(Modifier.height(20.dp))
                BasicText(app.label, style = style(26f, FontWeight.Bold, display = true))
                Spacer(Modifier.height(4.dp))
                BasicText(if (app.isBuiltin) "Built into Home" else app.packageName, style = style(13f, color = Ink.tertiary))
                Spacer(Modifier.height(22.dp))
                s.sheet.forEachIndexed { k, item ->
                    SheetButton(item.label, k == s.sheetIndex, item.danger) { s.sheetIndex = k; item.action() }
                    Spacer(Modifier.height(9.dp))
                }
            }
        }
    }
}

@Composable
private fun SheetButton(label: String, focused: Boolean, danger: Boolean, onClick: () -> Unit) {
    val k = animateFloatAsState(if (focused) 1.06f else 1f, spring(.6f, Spring.StiffnessMedium), label = "sk")
    val bg = animateColorAsState(if (focused) Color.White else Color.White.copy(.13f), tween(160), label = "sbg")
    Box(
        Modifier
            .width(380.dp).height(44.dp)
            .graphicsLayer { scaleX = k.value; scaleY = k.value; shadowElevation = if (focused) 16.dp.toPx() else 0f; shape = RoundedCornerShape(12.dp) }
            .background(bg.value, RoundedCornerShape(12.dp))
            .clickable(remember { MutableInteractionSource() }, null, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        BasicText(label, style = style(16.5f, FontWeight.SemiBold, if (danger) Ink.red else if (focused) Ink.dark else Color.White))
    }
}

// ---------------------------------------------------------------------------- Control Center
@Composable
fun ControlCenter(s: HomeState) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) { while (true) { now = System.currentTimeMillis(); delay(60_000L - now % 60_000L + 50) } }
    val rows = s.controlRows()
    Box(Modifier.fillMaxSize().padding(top = 22.dp, end = 26.dp), contentAlignment = Alignment.TopEnd) {
        SpringIn(.88f, originX = 1f, originY = 0f) {
            Column(
                Modifier
                    .width(408.dp)
                    .graphicsLayer { shadowElevation = 40.dp.toPx(); shape = RoundedCornerShape(30.dp) }
                    .background(Color(0xD9202024), RoundedCornerShape(30.dp))
                    .border(1.dp, Brush.verticalGradient(listOf(Color.White.copy(.28f), Color.White.copy(.05f))), RoundedCornerShape(30.dp))
                    .padding(22.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        BasicText(clock(now, s.clock24), style = style(38f, FontWeight.Bold, display = true, tracking = -.02f))
                        BasicText(SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(Date(now)), style = style(14f, color = Ink.secondary))
                    }
                    Box(Modifier.size(44.dp).background(Brush.linearGradient(listOf(Color(0xFF8E8CFF), Color(0xFFFF6FA8))), CircleShape), contentAlignment = Alignment.Center) {
                        Glyph("house", Color.White, Modifier.size(20.dp))
                    }
                }
                Spacer(Modifier.height(18.dp))
                rows.forEachIndexed { r, items ->
                    if (items.all { !it.wide }) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            items.forEachIndexed { c, it -> RoundControl(it, s.controlRow == r && s.controlCol == c) }
                        }
                        Spacer(Modifier.height(14.dp))
                    } else {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            items.forEachIndexed { c, it -> WideControl(it, s.controlRow == r && s.controlCol == c, Modifier.weight(1f)) }
                        }
                        Spacer(Modifier.height(10.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun RoundControl(item: ControlItem, focused: Boolean) {
    val k = animateFloatAsState(if (focused) 1.12f else 1f, spring(.6f, Spring.StiffnessMedium), label = "rk")
    val bg = animateColorAsState(if (focused) Color.White else Color.White.copy(.14f), tween(150), label = "rbg")
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(66.dp).clickable(remember { MutableInteractionSource() }, null) { item.action() }) {
        Box(
            Modifier.size(56.dp).graphicsLayer { scaleX = k.value; scaleY = k.value; shadowElevation = if (focused) 14.dp.toPx() else 0f; shape = CircleShape }
                .background(bg.value, CircleShape),
            contentAlignment = Alignment.Center,
        ) { Glyph(item.glyph, if (focused) Ink.dark else Color.White, Modifier.size(24.dp)) }
        Spacer(Modifier.height(7.dp))
        BasicText(item.label, style = style(11f, FontWeight.SemiBold, if (focused) Color.White else Ink.secondary), maxLines = 1)
    }
}

@Composable
private fun WideControl(item: ControlItem, focused: Boolean, modifier: Modifier) {
    val k = animateFloatAsState(if (focused) 1.05f else 1f, spring(.6f, Spring.StiffnessMedium), label = "wk")
    val bg = animateColorAsState(if (focused) Color.White else Color.White.copy(.12f), tween(150), label = "wbg")
    Row(
        modifier.height(64.dp)
            .graphicsLayer { scaleX = k.value; scaleY = k.value; shadowElevation = if (focused) 14.dp.toPx() else 0f; shape = RoundedCornerShape(18.dp) }
            .background(bg.value, RoundedCornerShape(18.dp))
            .clickable(remember { MutableInteractionSource() }, null) { item.action() }
            .padding(horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(38.dp).background(if (focused) Color(0x14000000) else Color.White.copy(.14f), CircleShape), contentAlignment = Alignment.Center) {
            if (item.glyph == "weather") WeatherIcon("part", Modifier.size(20.dp), if (focused) Ink.dark else Color.White)
            else Glyph(item.glyph, if (focused) Ink.dark else Color.White, Modifier.size(19.dp))
        }
        Spacer(Modifier.width(10.dp))
        Column {
            BasicText(item.label, style = style(14f, FontWeight.SemiBold, if (focused) Ink.dark else Color.White), maxLines = 1, overflow = TextOverflow.Ellipsis)
            item.detail?.let { BasicText(it, style = style(11.5f, color = if (focused) Ink.darkSecondary else Ink.tertiary), maxLines = 1, overflow = TextOverflow.Ellipsis) }
        }
    }
}

// ---------------------------------------------------------------------------- Settings (tvOS Settings app layout)
@Composable
fun SettingsScreen(s: HomeState) {
    val items = s.settingsItems()
    val cur = items.getOrNull(s.settingsIndex)
    Box(Modifier.fillMaxSize()) {
        BasicText("Home", Modifier.align(Alignment.TopCenter).padding(top = 30.dp), style = style(24f, FontWeight.Bold, display = true))
        // left: big icon and a description of the focused row
        Column(Modifier.width(470.dp).fillMaxHeight().padding(top = 120.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            SpringIn(.94f) {
                Box(Modifier.size(270.dp, 162.dp).graphicsLayer { shadowElevation = 34.dp.toPx(); shape = RoundedCornerShape(19.dp); clip = true }) {
                    TileFace(AppEntry(SETTINGS_KEY, "Home Settings", null), AppVisual(null, null, Color(0xFFF2F2F5), Color(0xFFA9A9B0)))
                }
            }
            Spacer(Modifier.height(30.dp))
            Crossfade(cur?.note ?: "", animationSpec = tween(220), label = "note") { note ->
                BasicText(note, Modifier.width(330.dp), style = style(14.5f, color = Ink.secondary, lineHeight = 21f).copy(textAlign = TextAlign.Center))
            }
        }
        // right: the list
        Column(Modifier.padding(start = 488.dp, top = 84.dp).width(430.dp)) {
            items.forEachIndexed { k, it ->
                SettingRow(it, k == s.settingsIndex) { s.settingsIndex = k; it.action?.invoke() ?: it.change?.invoke(1) }
                Spacer(Modifier.height(4.dp))
            }
        }
    }
}

@Composable
private fun SettingRow(item: SettingItem, focused: Boolean, onClick: () -> Unit) {
    val k = animateFloatAsState(if (focused) 1.045f else 1f, spring(.65f, Spring.StiffnessMedium), label = "rowk")
    val bg = animateColorAsState(if (focused) Color.White else Color.Transparent, tween(150), label = "rowbg")
    val fg = when {
        item.danger && !focused -> Ink.red
        focused -> Ink.dark
        else -> Color.White
    }
    Row(
        Modifier.fillMaxWidth().height(40.dp)
            .graphicsLayer { scaleX = k.value; scaleY = k.value; shadowElevation = if (focused) 14.dp.toPx() else 0f; shape = RoundedCornerShape(10.dp) }
            .background(bg.value, RoundedCornerShape(10.dp))
            .clickable(remember { MutableInteractionSource() }, null, onClick = onClick)
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        BasicText(item.label, Modifier.weight(1f), style = style(16.5f, FontWeight.Medium, if (item.danger && focused) Ink.red else fg))
        item.value?.let { BasicText(it, style = style(16f, color = if (focused) Ink.darkSecondary else Ink.tertiary), maxLines = 1) }
        if (item.action != null && item.value == null || item.change == null && item.action != null) {
            Spacer(Modifier.width(8.dp))
            Glyph("chevron", if (focused) Ink.darkSecondary else Ink.quaternary, Modifier.size(11.dp))
        }
    }
}

@Composable
fun CityDialog(s: HomeState) = Box(Modifier.fillMaxSize().background(Color.Black.copy(.4f)), contentAlignment = Alignment.Center) {
    val fr = remember { FocusRequester() }
    LaunchedEffect(Unit) { runCatching { fr.requestFocus() } }
    SpringIn {
        Column(Modifier.width(460.dp).background(Color(0xF2232327), RoundedCornerShape(24.dp)).padding(28.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            BasicText("Weather", style = style(24f, FontWeight.Bold, display = true))
            Spacer(Modifier.height(6.dp))
            BasicText("Type a city, then press Done. Leave it empty to turn weather off.", style = style(13f, color = Ink.secondary).copy(textAlign = TextAlign.Center))
            Spacer(Modifier.height(18.dp))
            BasicTextField(
                value = s.cityDraft,
                onValueChange = { s.cityDraft = it },
                singleLine = true,
                textStyle = style(19f, FontWeight.SemiBold),
                cursorBrush = SolidColor(Color.White),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { s.closeCity(save = true) }),
                modifier = Modifier.fillMaxWidth().focusRequester(fr)
                    .background(Color.White.copy(.14f), RoundedCornerShape(12.dp)).padding(horizontal = 16.dp, vertical = 12.dp),
            )
        }
    }
}

// ---------------------------------------------------------------------------- Aerial screensaver
@Composable
fun Aerial(s: HomeState) {
    var index by remember { mutableIntStateOf(Random.nextInt(Photos.all.size)) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(15_000)
            index = (index + 1 + Random.nextInt(Photos.all.size - 1)) % Photos.all.size
        }
    }
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) { while (true) { now = System.currentTimeMillis(); delay(60_000L - now % 60_000L + 50) } }

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        Crossfade(index, animationSpec = tween(2600, easing = LinearEasing), label = "aerial") { p ->
            val dir = remember { if (Random.nextBoolean()) 1f else -1f }
            val t = remember { Animatable(0f) }
            LaunchedEffect(Unit) { t.animateTo(1f, tween(19_000, easing = LinearEasing)) }
            val img = rememberPhoto(p)
            if (img != null) Image(img, null, Modifier.fillMaxSize().graphicsLayer {
                val k = if (s.calm) 0f else t.value
                val sc = 1.04f + .14f * k
                scaleX = sc; scaleY = sc
                translationX = dir * (k - .5f) * 50.dp.toPx()
                translationY = (k - .5f) * -14.dp.toPx()
            }, contentScale = ContentScale.Crop)
            // location title, like Apple's Aerials
            val cap = remember { Animatable(0f) }
            LaunchedEffect(Unit) { delay(1800); cap.animateTo(1f, tween(1200)); delay(6500); cap.animateTo(0f, tween(1400)) }
            Box(Modifier.fillMaxSize().padding(start = 50.dp, bottom = 46.dp), contentAlignment = Alignment.BottomStart) {
                BasicText(
                    Photos.all[p].caption,
                    Modifier.graphicsLayer { alpha = cap.value; translationY = (1 - cap.value) * 8.dp.toPx() },
                    style = style(30f, FontWeight.Bold, display = true).copy(shadow = Shadow(Color.Black.copy(.45f), Offset(0f, 3f), 18f)),
                )
            }
        }
        BasicText(
            clock(now, s.clock24),
            Modifier.align(Alignment.TopEnd).padding(top = 26.dp, end = 46.dp),
            style = style(30f, FontWeight.Bold, Color.White.copy(.9f), display = true).copy(shadow = Shadow(Color.Black.copy(.4f), Offset(0f, 2f), 14f)),
        )
    }
}

// ---------------------------------------------------------------------------- Toast
@Composable
fun Toast(s: HomeState) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(s.toastTick) {
        if (s.toastTick == 0) return@LaunchedEffect
        visible = true
        delay(2800)
        visible = false
    }
    Box(Modifier.fillMaxSize().padding(bottom = 30.dp), contentAlignment = Alignment.BottomCenter) {
        AnimatedVisibility(visible, enter = fadeIn() + slideInVertically { it } + scaleIn(initialScale = .9f), exit = fadeOut() + slideOutVertically { it / 2 } + scaleOut(targetScale = .95f)) {
            BasicText(
                s.toast ?: "",
                Modifier.graphicsLayer { shadowElevation = 18.dp.toPx(); shape = RoundedCornerShape(50) }
                    .background(Color(0xF0232327), RoundedCornerShape(50))
                    .border(1.dp, Color.White.copy(.1f), RoundedCornerShape(50))
                    .padding(horizontal = 20.dp, vertical = 11.dp),
                style = style(13.5f, FontWeight.SemiBold),
            )
        }
    }
}

// ---------------------------------------------------------------------------- Glyphs (drawn, so no icon fonts or files)
@Composable
fun Glyph(name: String, color: Color, modifier: Modifier) = Canvas(modifier) { glyph(name, color) }

private fun DrawScope.glyph(name: String, c: Color) {
    val w = size.width
    val h = size.height
    val sw = w * .1f
    val line = Stroke(sw, cap = StrokeCap.Round, join = StrokeJoin.Round)
    when (name) {
        "play" -> drawPath(Path().apply { moveTo(w * .2f, h * .1f); lineTo(w * .92f, h * .5f); lineTo(w * .2f, h * .9f); close() }, c)
        "dots" -> repeat(3) { k -> drawCircle(c, w * .1f, Offset(w * (.18f + k * .32f), h / 2)) }
        "chevron" -> drawPath(Path().apply { moveTo(w * .32f, h * .12f); lineTo(w * .7f, h * .5f); lineTo(w * .32f, h * .88f) }, c, style = Stroke(w * .14f, cap = StrokeCap.Round, join = StrokeJoin.Round))
        "moon" -> {
            val p = Path.combine(PathOperation.Difference,
                Path().apply { addOval(Rect(w * .1f, h * .1f, w * .9f, h * .9f)) },
                Path().apply { addOval(Rect(w * .32f, -h * .08f, w * 1.08f, h * .68f)) })
            drawPath(p, c)
        }
        "wifi" -> {
            for (k in 0..2) {
                val r = w * (.18f + k * .17f)
                drawArc(c, 225f, 90f, false, Offset(w / 2 - r, h * .78f - r), Size(r * 2, r * 2), style = line)
            }
            drawCircle(c, w * .07f, Offset(w / 2, h * .78f))
        }
        "display" -> {
            drawRoundRect(c, Offset(w * .08f, h * .14f), Size(w * .84f, h * .56f), CornerRadius(w * .08f), style = Stroke(sw))
            drawLine(c, Offset(w * .32f, h * .86f), Offset(w * .68f, h * .86f), sw, StrokeCap.Round)
        }
        "sound" -> {
            drawPath(Path().apply { moveTo(w * .1f, h * .38f); lineTo(w * .28f, h * .38f); lineTo(w * .5f, h * .16f); lineTo(w * .5f, h * .84f); lineTo(w * .28f, h * .62f); lineTo(w * .1f, h * .62f); close() }, c)
            drawArc(c, -45f, 90f, false, Offset(w * .38f, h * .3f), Size(w * .4f, h * .4f), style = line)
            drawArc(c, -50f, 100f, false, Offset(w * .3f, h * .14f), Size(w * .68f, h * .72f), style = line)
        }
        "bluetooth" -> drawPath(Path().apply {
            moveTo(w * .28f, h * .3f); lineTo(w * .72f, h * .68f); lineTo(w * .5f, h * .88f); lineTo(w * .5f, h * .12f); lineTo(w * .72f, h * .32f); lineTo(w * .28f, h * .7f)
        }, c, style = line)
        "gear" -> {
            val cc = center
            val r = size.minDimension / 2
            fun oval(x: Float, y: Float, rr: Float) = Rect(x - rr, y - rr, x + rr, y + rr)
            val teeth = Path().apply {
                // 12 tapered teeth
                repeat(12) { k ->
                    val a = Math.toRadians(k * 30.0)
                    fun pt(rad: Float, off: Float): Offset {
                        val x = rad * kotlin.math.cos(a) - off * kotlin.math.sin(a)
                        val y = rad * kotlin.math.sin(a) + off * kotlin.math.cos(a)
                        return Offset(cc.x + x.toFloat(), cc.y + y.toFloat())
                    }
                    val p1 = pt(r * .6f, -r * .15f); val p2 = pt(r * .98f, -r * .09f)
                    val p3 = pt(r * .98f, r * .09f); val p4 = pt(r * .6f, r * .15f)
                    moveTo(p1.x, p1.y); lineTo(p2.x, p2.y); lineTo(p3.x, p3.y); lineTo(p4.x, p4.y); close()
                }
            }
            val body = Path.combine(PathOperation.Union, Path().apply { addOval(oval(cc.x, cc.y, r * .74f)) }, teeth)
            val holes = Path().apply { addOval(oval(cc.x, cc.y, r * .34f)) }
            drawPath(Path.combine(PathOperation.Difference, body, holes), c)
            drawCircle(c, r * .14f, cc)
        }
        "sliders" -> for (k in 0..2) {
            val y = h * (.22f + k * .28f)
            drawLine(c, Offset(w * .1f, y), Offset(w * .9f, y), sw * .8f, StrokeCap.Round)
            drawCircle(c, w * .12f, Offset(w * (.3f + (k % 2) * .4f), y))
        }
        "search" -> {
            drawCircle(c, w * .28f, Offset(w * .43f, h * .43f), style = Stroke(sw * 1.1f))
            drawLine(c, Offset(w * .64f, h * .64f), Offset(w * .88f, h * .88f), sw * 1.3f, StrokeCap.Round)
        }
        "house" -> {
            drawPath(Path().apply { moveTo(w * .5f, h * .1f); lineTo(w * .92f, h * .48f); lineTo(w * .8f, h * .48f); lineTo(w * .8f, h * .9f); lineTo(w * .2f, h * .9f); lineTo(w * .2f, h * .48f); lineTo(w * .08f, h * .48f); close() }, c)
        }
    }
}

@Composable
fun WeatherIcon(kind: String, modifier: Modifier, color: Color) = Canvas(modifier) {
    val w = size.width
    val h = size.height
    fun cloud(dy: Float = 0f, a: Float = 1f) {
        val cc = color.copy(alpha = color.alpha * a)
        drawCircle(cc, w * .2f, Offset(w * .36f, h * .55f + dy))
        drawCircle(cc, w * .26f, Offset(w * .58f, h * .45f + dy))
        drawRoundRect(cc, Offset(w * .14f, h * .52f + dy), Size(w * .74f, h * .26f), CornerRadius(h * .13f))
    }
    when (kind) {
        "sun" -> {
            drawCircle(color, w * .2f, center)
            repeat(8) { k -> rotate(k * 45f) { drawLine(color, Offset(w / 2, h * .06f), Offset(w / 2, h * .18f), w * .08f, StrokeCap.Round) } }
        }
        "part" -> { drawCircle(color.copy(alpha = color.alpha * .85f), w * .17f, Offset(w * .32f, h * .32f)); cloud(h * .06f) }
        "cloud" -> cloud()
        "fog" -> repeat(3) { k -> drawLine(color, Offset(w * .15f, h * (.35f + k * .17f)), Offset(w * .85f, h * (.35f + k * .17f)), w * .08f, StrokeCap.Round) }
        "snow" -> { cloud(-h * .12f); repeat(3) { k -> drawCircle(color, w * .05f, Offset(w * (.32f + k * .18f), h * .86f)) } }
        else -> { cloud(-h * .12f); repeat(3) { k -> drawLine(color, Offset(w * (.34f + k * .18f), h * .76f), Offset(w * (.3f + k * .18f), h * .94f), w * .07f, StrokeCap.Round) } }
    }
}
