$.fn.selectpick = function( options) {
  var defaults = {
    placeHolder: '',
    search: false,
    searchPlaceHolder: '',
    title: '',
    listTitle: '',
    multiple: 'multiple',
    pills: false,
    disabled: '',
    checkbox: false,
    closeButton: false,
    buttonText: 'Ok',
    searchResultText: 'No results found',
    scrollMaxHeight: 200
  };


  var geti18n = function(txt){
    return (window['spa']) ? (txt.beginsWithStr('i18n:')) ? ' data-i18n="'+ txt.trimLeftStr('i18n:') +'"' : '' : txt;
  },

  geti18nPlaceHolder = function(txt){
    return (window['spa']) && (txt.beginsWithStr('i18n:')) ? 'data-i18n="placeholder:\''+txt+'\'"' : ' placeholder="'+ txt +'" ';
  };

  var settings = $.extend( {}, defaults, options );

  return this.each(function() {
      var $elem         = $( this ),
          elemId        = $elem.attr('id'),
          $options      = $elem.find('option'),
          dropdownItem  = '',
          multiple      = (($elem.attr('multiple')) || ''),
          disabled      = (($elem.attr('disabled')) || ''),
          elmClasses    = (($elem.attr('class')) || ''),
          buttonState   = (settings.closeButton) ? 'has-close-button' : 'no-close-button',
          tabIndex      = (disabled) ? 'tabindex="-1"' : '';

      $options.each(function(i, option){
        var $option         = $(option),
            optionText      = $option.text(),
            optionSelected  = ($option.is(':selected') ? 'selected' : ''),
            optionDisabled  = ($option.is(':disabled') ? 'disabled' : ''),
            optionTabIndex  = (optionDisabled) ? 'tabindex="-1"' : '';
        $option.attr('data-sl-rel', i);
        dropdownItem  += '<a class="dropdown-item '+optionSelected+' '+optionDisabled+'" '+optionTabIndex+' href="javascript:;" data-dr-rel="'+i+'" draggable="false">'+optionText+'</a>';
      });

      var markup = [
        '<a href="javascript:void(0);" class="select dropdown-toggle ',elmClasses,' ',disabled,'" ',tabIndex,' id="',elemId,'_select" aria-haspopup="true" aria-expanded="false" ', geti18n(settings.placeHolder) ,'>', settings.placeHolder ,'</a>',
        '<div class="dropdown-menu ', (settings.checkbox ? 'check-box' : '') ,' ',buttonState,'" data-sel-items="">',
        '<li class="dropdown-item title ', !!settings.title ,'" ', geti18n(settings.title) ,'>', settings.title ,'</li>',
        '<li class="dropdown-item search ', settings.search ,'"><input type="text" class="form-control" ', geti18nPlaceHolder(settings.searchPlaceHolder) ,' autocomplete="off" /></li>',
        '<li class="dropdown-item list-title ', !!settings.listTitle ,'" ', geti18n(settings.listTitle) ,'>', settings.listTitle ,'</li>',
        '<div class="dropdown-menu-scroll" style="max-height:', settings.scrollMaxHeight ,'px">', dropdownItem , '</div>',
        '<li class="dropdown-item search-result hide" ', geti18n(settings.searchResultText) ,'>', settings.searchResultText ,'</li>',
        '<li class="dropdown-item close-button ', settings.closeButton ,'"><a href="javascript:;" class="btn btn-primary" ', geti18n(settings.buttonText) ,'>', settings.buttonText ,'</a></li>',
        '</div>'
      ].join('');

      $elem.closest('div').addClass('dropdown selectpicker '+ multiple);

      var $selectPick     = $elem.closest('.selectpicker'),
          isSelectPicker  = ($selectPick.find('#'+elemId+'_select').length < 1);

      if(isSelectPicker){
        $(markup).insertAfter($elem);
      }else{
        $selectPick.find('.dropdown-menu-scroll').html(dropdownItem);
      }
      if (window['spa']) {
        spa.i18n.apply($selectpicker);
      }
      if(settings.pills){
        $elem.closest('div').addClass('pills')
      }

      var $selectpicker = $elem.closest('.selectpicker');
      if(isSelectPicker){
        $selectpicker.find('.search input').on("keyup", function() {
          var $this = $(this),
            value = $this.val().toLowerCase();
          $this.closest('.dropdown-menu').find('a.dropdown-item').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
          });
          var searchStatus = ($selectpicker.find('a.dropdown-item:visible').length ? 'addClass' : 'removeClass');
          $selectpicker.find('.search-result')[searchStatus]('hide');
        });

        $selectpicker.on('click', '.dropdown-toggle', function(e){
          e.stopPropagation();
          var $this         = $(this),
              $dropdownMenu = $this.closest('.selectpicker').find('.dropdown-menu');
          $('.dropdown.selectpicker').not($(this).closest('.selectpicker')).removeClass('show').find('.dropdown-menu').removeClass('show');
          $selectpicker.toggleClass('show').find('.dropdown-menu').toggleClass('show');
          $dropdownMenu.find('.search input').val('');
          $dropdownMenu.find('a.dropdown-item').css('display', 'block');
          $dropdownMenu.find('a.dropdown-item.selected').focus();
          if (window['spa']) {
            spa.i18n.apply('.selectpicker .dropdown-menu');
          }
        });

        $selectpicker.on('click', '.dropdown-menu', function(e){
          $(this).is('.show') && $selectpicker.hasClass('multiple') && e.stopPropagation();
        });

        $selectpicker.on('click', '.close-button a.btn', function(e){
          $selectpicker.removeClass('show').find('.dropdown-menu').removeClass('show');
        });

        $selectpicker.on('click', 'a.dropdown-item', function(e){
          var $this         = $(this),
              drRel         = $this.data('drRel'),
              multiple      = $selectpicker.hasClass('multiple'),
              $dropdownMenu = $this.closest('.dropdown-menu'),
              selItems      = $dropdownMenu.data('selItems'),
              selItemsArry  = selItems ? selItems.split('|') : [];
          if(multiple){
            $this.toggleClass('selected');
          }else{
            $dropdownMenu.find('a.dropdown-item').removeClass('selected');
            $this.addClass('selected');
          }

          var selectStatus = $this.hasClass('selected');
          $selectpicker.find('[data-sl-rel="'+drRel+'"]').prop('selected', selectStatus);
          if(selectStatus){
            selItemsArry.push($this.text());
            $dropdownMenu.data('selItems', selItemsArry.join('|')).attr('data-sel-items', selItemsArry.join('|'));
          }else{
            var remItem = selItemsArry.indexOf($this.text());
            if(remItem > -1){
              selItemsArry.splice(remItem, 1);
            }
            $dropdownMenu.data('selItems', selItemsArry.join('|')).attr('data-sel-items', selItemsArry.join('|'));
          }
          $.fn.selectpick.selections($selectpicker, settings.placeHolder, settings.pills);
          $selectpicker.find('select').trigger('change');
        });

        $selectpicker.on('click', 'a.pill-close', function(e){
          e.stopPropagation();
          var $this = $(this),
              plRel = $this.data('plRel');

          $selectpicker.find('[data-dr-rel="'+plRel+'"]').removeClass('selected');
          $selectpicker.find('[data-sl-rel="'+plRel+'"]').prop('selected', false);
          $.fn.selectpick.selections($selectpicker, settings.placeHolder, settings.pills);
          $selectpicker.find('select').trigger('change');

        });
      }
      $.fn.selectpick.selections($selectpicker, settings.placeHolder, settings.pills);
  });
};

$.fn.selectpick.selections = function(scope, placeHolder, pills) {
  var $scope      = scope,
      pillHtml    = '',
      multiple    = $scope.hasClass('multiple'),
      itemsTitle  = '';
  $scope.find('a.dropdown-item.selected').each(function(i, el){
    var $this       = $(this),
        optionText  = $this.text(),
        drRel       = $this.data('drRel'),
        selItems    = $this.closest('.dropdown-menu').data('selItems'),
        selItemsArry = selItems.split('|');

    if (multiple) {
      if(pills){
        pillHtml += '<span class="pill-button">'+optionText+'<a href="javascript:;" class="pill-close" data-pl-rel="'+drRel+'">×</a></span>';
      }
      else{
        itemsTitle = selItemsArry.join(', ');
        var oText = (selItemsArry.length > 1) ? selItemsArry[0] + '<span title="' + itemsTitle + '">...(+' + (selItemsArry.length - 1) + ')</span>' : optionText;
        pillHtml = '<span>'+oText+'</span>';
      }
    } else {
      pillHtml = '<span>'+optionText+'</span>';
    }

  });

  $scope.find('.dropdown-toggle').html((pillHtml ? pillHtml : '<span>'+placeHolder+'</span>'));
  if (window['spa'] && pillHtml.length == 0) {
    if(placeHolder.beginsWithStr('i18n:')){
      spa.i18n.apply('.selectpicker');
    }
  }
};

$(document).click(function(e) {
  $('.selectpicker:not(.multiple)').removeClass('show').find('.dropdown-menu').removeClass('show');
  $('.no-close-button').removeClass('show').closest('.selectpicker').removeClass('show');
});

$(document).on('focusout', '.selectpicker .dropdown-menu.show:not(.has-close-button) .dropdown-item.close-button .btn', function() {
  setTimeout(() => {
    if(!$(this).siblings().is(':focus')){
      $(this).closest('.selectpicker').removeClass('show').find('.dropdown-menu').removeClass('show');
    }
  }, 100);
});

document.onkeydown = function(evt) {
  evt = evt || window.event;
  if (evt.keyCode == 27) {
    $('.selectpicker').removeClass('show').find('.dropdown-menu').removeClass('show');
  }
  if (evt.keyCode == 32) {
    $('.selectpicker.show').find('.dropdown-menu a.dropdown-item:focus').trigger('click');
  }
};

$.fn.selectpick.resetValue = function(scope) {
  var $scope = $(scope);

  $scope.find('a.select.dropdown-toggle > span').text('');
  $scope.find('div.dropdown-menu-scroll .selected').removeClass('selected');
};