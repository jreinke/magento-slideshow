<?php
/**
 * @category    Bubble
 * @package     Bubble_Slideshow
 * @version     1.1.0
 * @copyright   Copyright (c) 2014 BubbleShop (http://www.bubbleshop.net)
 */
class Bubble_Slideshow_Block_Adminhtml_Widget_Options extends Mage_Widget_Block_Adminhtml_Widget_Options
{
    protected function _addField($parameter)
    {
        if ($fieldset = $parameter->getFieldset()) {
            $this->resetFieldset($fieldset);
        }

        return parent::_addField($parameter);
    }

    public function resetFieldset($label)
    {
        $fieldsetHtmlId = 'options_fieldset' . uniqid();
        $fieldset = $this->getForm()->addFieldset($fieldsetHtmlId, array(
            'legend'    => $this->helper('widget')->__($label),
            'class'     => 'fieldset-wide',
        ));
        $this->setData('main_fieldset', $fieldset);

        return $this;
    }
}