BubbleSlideshow = Class.create({
    initialize: function(carousel, options) {
        this.carousel = carousel;
        this.container = carousel.down();
        this.tray = null;
        this.effect = null;
        this.randId = Math.round(Math.random() * 100000000);
        this.clrTimerInterval = null;
        this.trayLeft = 0;

        this.options = Object.extend({
            transitionSpeed:        700,
            displayTime:            4000,
            hideCenter:             false,
            advance:                1,
            margin:                 0,
            showArrows:             true,
            auto:                   false,
            width:                  0,
            height:                 0,
            visibleImages:          1,
            padding:                0,
            opacity:                1,
            iconPrevious:           '',
            iconNext:               '',
            navWidth:               100,
            navHeight:              100,
            navPosition:            'center',
            blackAndWhite:          false,
            position:               'left',
            showBullets:            false,
            bulletsWidth:           12,
            bulletsHeight:          12,
            bulletsMargin:          10,
            bulletsPosition:        'left',
            bulletsRounded:         true,
            bulletsRadius:          8,
            bulletsActiveColor:     'white',
            bulletsInactiveColor:   'silver',
            onMoveLeft:         function() {},
            onMoveRight:        function() {},
            onMoveEnd:          function() {}
        }, options || {});

        var o = this.options,
            randId = this.randId,
            numItems = this.container.childElements().length,
            links = [],
            itemSources = [];

        if (numItems <= 1) {
            return;
        }

        if (numItems <= o.visibleImages) {
            o.showArrows = false;
            o.visibleImages = numItems;
        }

        this.container.childElements().each(function(item) {
            var a = item.down('a');
            links.push({
                href: a ? a.href : undefined,
                target: a ? a.target : undefined,
                css: a ? a.className : undefined
            });
            if (item.down('img')) {
                itemSources.push(item.down('img').src);
            } else {
                itemSources.push(undefined);
            }
        });

        // Build carousel container
        this.container.replace('<div id="bs-' + randId + '"></div>'); // Kick the list and its content to the curb and replace with a div
        this.container = $('bs-' + randId); // Reassign the new div as our obj
        this.container.setStyle({
            width: ((o.width * o.visibleImages) + (o.margin * (o.visibleImages - 1))) + 'px',
            height: o.height + 'px',
            overflow: 'hidden',
            position: 'relative'
        });

        // Build tray to hold items and populate with item container divs. Move tray one item width to the left.
        var itemMargin = '';
        if (o.position == 'left') {
            this.trayLeft = (o.width + o.margin) * numItems;
            itemMargin = 'margin:0 ' + o.margin + 'px 0 0;';
            carousel.setStyle({ position: 'absolute', top: '0', left: '-' + o.padding + 'px' });
        } else if (o.position == 'center') {
            this.trayLeft = (o.width * numItems) + ((o.margin * numItems) + o.margin / 2);
            itemMargin = 'margin:0 ' + (o.margin / 2) + 'px;';
            var marginLeft = '-' + ((o.width * o.visibleImages / 2) + (o.margin * (o.visibleImages - 1) / 2) + o.padding) + 'px';
            carousel.setStyle({ position: 'absolute', top: '0', left: '50%', marginLeft: marginLeft });
        } else if (o.position == 'right') {
            this.trayLeft = (o.width * numItems) + o.margin * (numItems + 1);
            itemMargin = 'margin:0 0 0 ' + o.margin + 'px;';
            carousel.setStyle({ position: 'absolute', top: '0', right: '-' + o.padding + 'px' });
        }

        this.trayLeft *= -1;
        var trayLeft = 'left:' + this.trayLeft + 'px;';
        var trayWidth = 3 * numItems * (o.width + o.margin);
        this.container.insert('<div id="bs-tray-' + randId + '" class="bs-tray" style="position:relative;width:' + trayWidth + 'px;' + trayLeft + '">');
        this.tray = $('bs-tray-' + randId);
        for (i = 0; i < numItems; i++) {
            this.tray.insert('<div class="bs-item" style="overflow:hidden;float:left;position:relative; ' + itemMargin + '">');
        }

        // Populate the individual tray divs with items. Add links and captions where available.
        $$('#bs-' + randId + ' .bs-item').each(function(el, index) {
            el.insert('<img src="' + itemSources[index] + '" width="' + o.width + '" height="' + o.height + '" style="' + (o.opacity ? 'opacity: ' + o.opacity : '') + '" />');
            if (o.blackAndWhite) {
                el.down('img').setStyle({
                    '-webkit-filter': 'grayscale(100%)',
                    '-moz-filter': 'grayscale(100%)',
                    'filter': 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0\'/></filter></svg>#grayscale")'
                });
            }
            if (links[index] != undefined && links[index].href != undefined && el.down('img')) {
                // IE8 needs the </a>. see http://outwardfocusdesign.com/blog/web-design-professionals/jquery/possible-fix-for-jquerys-wrap-function-for-ie8/
                el.down('img').wrap('a', {
                    'class':  links[index].css + ' bs-link',
                    'target':  links[index].target,
                    'href': links[index].href
                });
            }
        }, this);

        // Triple containers
        var items = $$('#bs-' + randId + ' .bs-item');
        for (var i = 1; i <= 2; i++) {
            items.each(function(el) {
                this.tray.insert(el.cloneNode(true));
            }, this);
        }

        $$('#bs-' + randId + ' .bs-item').invoke('removeAttribute', 'id');

        // Build left/right nav
        if (o.showArrows) {
            if (o.navPosition == 'inside') {
                var navTop = (o.height / 2 - (o.navHeight / 2));
                var navLeft = '0';
                var navRight = '0';
            } else if (o.navPosition == 'outside') {
                var navTop = (o.height / 2 - (o.navHeight / 2));
                var navLeft = '-' + o.navWidth;
                var navRight = '-' + o.navWidth;
            } else { // center
                var navTop = (o.height / 2 - (o.navHeight / 2));
                var navLeft = '-' + (o.navWidth / 2);
                var navRight = '-' + (o.navWidth / 2);
            }
            this.container.insert('<div class="bs-left-nav" style="position:absolute;left:' + navLeft + 'px;top:' + navTop + 'px;">');
            this.container.insert('<div class="bs-right-nav" style="position:absolute;right:' + navRight + 'px;top:' + navTop + 'px;">');
            this.container.down('.bs-left-nav').insert('<img style="cursor:pointer;" src="' + o.iconPrevious + '" width="' + o.navWidth + '" height="' + o.navHeight + '" />');
            this.container.down('.bs-right-nav').insert('<img style="cursor:pointer;" src="' + o.iconNext + '" width="' + o.navWidth + '" height="' + o.navHeight + '" />');
            // Add click events for the left/right nav
            this.container.down('.bs-left-nav img').observe('click', this.prev.bindAsEventListener(this));
            this.container.down('.bs-right-nav img').observe('click', this.next.bindAsEventListener(this));
        }

        // Build bullets navigation if enabled
        if (o.showBullets) {
            var bulletsHtml = '<div class="bs-nav-wrapper"><div class="bs-nav">';
            for (i = 0; i < numItems; i++) {
                bulletsHtml += '<a href="#" style="width:' + o.bulletsWidth + 'px;height:' + o.bulletsHeight + 'px;margin-right:' + o.bulletsMargin + 'px;border-radius: ' + o.bulletsRadius + 'px;background: ' + (i === 0 ? o.bulletsActiveColor  : o.bulletsInactiveColor) + ';"' + (i === 0 ? 'class="on"' : '') + '></a>';
            }
            bulletsHtml += '</div></div>';
            this.carousel.insert(bulletsHtml);

            var self = this;
            var bullets = carousel.select('.bs-nav a');
            bullets.each(function(el) {
                el.observe('click', function(e) {
                    e.stop();
                    var el = e.element();
                    var j = 0;
                    var k = 0;
                    for (var i = 0; i < bullets.length; i++) {
                        if (bullets[i].hasClassName('on')) {
                            j = i;
                        }
                        if (bullets[i] == el) {
                            k = i;
                        }
                    }
                    if (j !== k) {
                        if (j < k) {
                            self.moveLeft(k - j);
                        } else {
                            self.moveRight(j - k);
                        }
                    }
                });
            });
        }

        // If nav outside carousel, wrap carousel in a div and set padding to compensate for nav. also dont animate nav if outside images
        this.container.wrap('div', {
            'id': 'bs-' + randId + '-wrapper',
            'class': 'bs-wrapper'
        });
        $('bs-' + randId + '').setStyle({ width: this.container.getWidth() });
        if (o.showArrows) {
            $('bs-' + randId + '-wrapper').insert({ bottom: this.container.down('.bs-left-nav').remove() });
            $('bs-' + randId + '-wrapper').insert({ bottom: this.container.down('.bs-right-nav').remove() });
        }

        // Adjust wrapped width when using peek padding
        this.container.addClassName('bs-peek-padding');
        this.container.setStyle({ padding: '0 ' + o.padding + 'px' });

        if (o.auto && !this.isAnimated()) {
            this.play();
        } else {
            this.resetTimer();
        }
    },

    isAnimated: function() {
        return this.tray.hasClassName('animated');
    },

    prev: function() {
        if (!this.isAnimated()) {
            this.moveRight(this.options.advance);
            this.stop();
        }
    },

    next: function() {
        if (!this.isAnimated()) {
            this.moveLeft(this.options.advance);
            this.stop();
        }
    },

    moveLeft: function(dist) {
        this.options.onMoveLeft.call(this, dist);
        this.move(dist, 'left');
    },

    moveRight: function(dist) {
        this.options.onMoveRight.call(this, dist);
        this.move(dist, 'right');
    },

    move: function(dist, dir) {
        var self = this,
            x = (this.options.width + this.options.margin) * dist;
        if (dir == 'left') {
            x *= -1;
        }

        new Effect.Move(this.tray.id, {
            x: x,
            y: 0,
            mode: 'relative',
            duration: self.options.transitionSpeed / 1000, // in seconds
            transition: Effect.Transitions.sinoidal,
            beforeStart: function() {
                self.tray.addClassName('animated');
            },
            afterFinish: function() {
                for (var i = 1; i <= dist; i++) {
                    var nav = null;
                    if (dir == 'left') {
                        self.tray.insert({ bottom: self.container.down('.bs-item:first').remove() });
                        if (self.options.showBullets) {
                            nav = self.carousel
                                .down('.bs-nav a.on')
                                .removeClassName('on')
                                .setStyle({ background: self.options.bulletsInactiveColor });
                            if (nav.next()) {
                                nav.next()
                                    .addClassName('on')
                                    .setStyle({ background: self.options.bulletsActiveColor });
                            } else {
                                self.carousel
                                    .down('.bs-nav a:first')
                                    .addClassName('on')
                                    .setStyle({ background: self.options.bulletsActiveColor });
                            }
                        }
                    } else {
                        self.tray.insert({ top: self.container.down('.bs-item:last').remove() });
                        if (self.options.showBullets) {
                            nav = self.carousel
                                .down('.bs-nav a.on')
                                .removeClassName('on')
                                .setStyle({ background: self.options.bulletsInactiveColor });
                            if (nav.previous()) {
                                nav.previous()
                                    .addClassName('on')
                                    .setStyle({ background: self.options.bulletsActiveColor });
                            } else {
                                self.carousel
                                    .down('.bs-nav a:last')
                                    .addClassName('on')
                                    .setStyle({ background: self.options.bulletsActiveColor });
                            }
                        }
                    }
                }
                self.tray.setStyle({ left: self.trayLeft + 'px' });
                self.tray.removeClassName('animated');
                self.options.onMoveEnd.call(this);
            }
        });
    },

    animate: function() {
        var self = this;
        this.clrTimerInterval = setInterval(function() {
            self.moveLeft(self.options.advance);
        }, this.options.displayTime);
    },

    resetTimer: function() {
        clearInterval(this.clrTimerInterval);
    },

    play: function() {
        this.options.auto = true;
        if (!this.isAnimated()) {
            this.animate();
        }
    },

    stop: function() {
        this.options.auto = false;
        this.resetTimer();
    }
});
