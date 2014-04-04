<?php
/**
 * Handle slideshow parameters and display them.
 *
 * @category    Bubble
 * @package     Bubble_Slideshow
 * @version     1.0.4
 * @copyright   Copyright (c) 2013 BubbleCode (http://shop.bubblecode.net)
 */
class Bubble_Slideshow_Block_Slideshow
    extends Mage_Core_Block_Template
    implements Mage_Widget_Block_Interface
{
    protected $_images = null;

    protected function _construct()
    {
        parent::_construct();
        $this->setTemplate('bubble/slideshow/slideshow.phtml');
    }

    public function getSlideshowId()
    {
        return substr(sha1(microtime(true)), 0, 7);
    }

    public function getImages()
    {
        if (null === $this->_images) {
            $images = new Varien_Data_Collection();
            $i = 1;
            while ($this->hasData('image' . $i)) {
                $image = new Varien_Object();
                $image->setImage($this->getData('image' . $i))
                    ->setLink($this->getData('link' . $i))
                    ->setNewWindow((bool) $this->getData('new_window' . $i));
                $images->addItem($image);
                $i++;
            }
            $this->_images = $images;
        }

        return $this->_images;
    }

    public function getImageUrl($image)
    {
        if ($image && (strpos($image, 'http') !== 0)) {
            $image = Mage::getDesign()->getSkinUrl($image);
        }

        return $image;
    }

    public function getLinkUrl($link)
    {
        if ($link && (strpos($link, 'http') !== 0)) {
            $link = Mage::app()->getStore()->getBaseUrl() . ltrim($link, '/');
        }

        return $link;
    }

    public function getWidth()
    {
        return intval($this->getData('width'));
    }

    public function getHeight()
    {
        return intval($this->getData('height'));
    }

    public function getMargin()
    {
        return intval(max($this->getData('margin'), 0));
    }

    public function getOpacity()
    {
        return floatval(max(min($this->getData('opacity'), 1), 0.1));
    }

    public function getDisplayTime()
    {
        return intval($this->getData('display_time'));
    }

    public function getAnimationSpeed()
    {
        return intval($this->getData('animation_speed'));
    }

    public function isBackEnabled()
    {
        return (bool) $this->getData('enable_back') && $this->getImages()->count() >= 3;
    }

    public function getShowControls()
    {
        return (bool) $this->getData('show_controls');
    }

    public function getNavWidth()
    {
        return intval($this->getData('nav_width'));
    }

    public function getNavHeight()
    {
        return intval($this->getData('nav_height'));
    }

    public function getNavPosition()
    {
        return $this->hasData('nav_position') ? $this->getData('nav_position') : 'center';
    }

    public function getVisibleImages()
    {
        return intval(max(min($this->getData('visible_images'), $this->getImages()->count()), 1));
    }

    public function getPadding()
    {
        return intval($this->getWidth() + $this->getMargin() * ($this->getImages()->count() - 1));
    }

    public function getPosition()
    {
        return $this->hasData('position') ? $this->getData('position') : 'left';
    }
}