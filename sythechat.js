var BOSH_SERVICE = 'http://chat.sythe.org/http-bind/';
var xmpp_domain = "chat.sythe.org";
var conference_service = "conference." + xmpp_domain;
var SYTHECHAT_VERSION_JS = '2.1';
var SYTHECHAT_VERSION_HTML = '2.1';
var sythechat_debugging = true;
var sythechat_connection = null;
var sythechat_myjid = null;
var sythe_simplename = null;
var sythe_token = null;
var sythechat_init_join = null;
var sythechat_init_chat = null;
var sythechat_intercom;
var sythechat_title_interval;
var sythechat_alert_activechats;
var option_setting_sounds = "1";
var option_setting_lobbyjoin = "1";
var option_setting_invites = "1";
var option_setting_joinleave = "1";
option_0 = "setting_sounds=0";
option_1 = "setting_lobbyjoin=1";
option_2 = "setting_invites=1";
option_3 = "setting_joinleave=1";
option_setting_sounds = "0";
option_setting_lobbyjoin = "1";
option_setting_invites = "1";
option_setting_joinleave = "1";

function init_sythechat(init_join, init_chat) {
    if (init_join) {
        sythechat_init_join = init_join;
    }
    if (init_chat) {
        sythechat_init_chat = init_chat;
    }
    $("#sythechat_tabs").tabs();
    $("#sythechat_menu_list").children("li").hover(function () {
        $(this).addClass("hover");
    }, function () {
        $(this).removeClass("hover");
    });
    $("#sythechat_list").children("li").hover(function () {
        $(this).addClass("hover");
    }, function () {
        $(this).removeClass("hover");
    });
    $("#sythechat_menu_debugging").click(function () {
        $("#sythechat_debugging").toggle();
    });
    $("#sythechat_menu_conference_create").click(function () {
        $("#sythechat_dialog_conference_create").dialog({
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Create": function () {
                    sythechat_conference_create($(this).find("#conference_id").val(), $(this).find("#instant_conference").is(":checked"));
                    $(this).find("#conference_id").val("");
                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    });
    $("#sythechat_dialog_conference_create").find("#conference_id").keypress(function (e) {
        if (e.which == 13) {
            sythechat_conference_create($(this).val(), $(this).parent().find("#instant_conference").is(":checked"));
            $(this).val("");
            $("#sythechat_dialog_conference_create").dialog("close");
        }
    });
    $("#sythechat_menu_conference_join").click(function () {
        $("#sythechat_dialog_conference_join").dialog({
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Join": function () {
                    sythechat_conference_join($(this).find("#conference_id").val());
                    $(this).find("#conference_id").val("");
                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    });
    $("#sythechat_dialog_conference_join").find("#conference_id").keypress(function (e) {
        if (e.which == 13) {
            sythechat_conference_join($(this).val());
            $(this).val("");
            $("#sythechat_dialog_conference_join").dialog("close");
        }
    });
    $("#sythechat_menu_contact_add").click(function () {
        $("#sythechat_dialog_contact_add").dialog({
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Add": function () {
                    sythechat_contact_add($(this).find("#contact_id").val());
                    $(this).find("#contact_id").val("");
                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    });
    $("#sythechat_dialog_contact_add").find("#contact_id").keypress(function (e) {
        if (e.which == 13) {
            sythechat_contact_add($(this).val());
            $(this).val("");
            $("#sythechat_dialog_contact_add").dialog("close");
        }
    });
    $("#sythechat_menu_change_status").click(function () {
        $("#sythechat_dialog_status").dialog({
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Save": function () {
                    sythechat_change_status($(this).find("#status_code").val(), $(this).find("#status_text").val());
                    $(this).dialog("close");
                },
                "Cancel": function () {
                    $(this).dialog("close");
                }
            }
        });
    });
    $("#sythechat_menu_information").click(function () {
        $("#sythechat_dialog_information").dialog({
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Ok": function () {
                    $(this).dialog("close");
                }
            }
        });
    });
    $("#sythechat_menu_disconnect").click(function () {
        $("#sythechat_dialog_disconnect_confirm").dialog({
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Yes": function () {
                    sythechat_disconnect();
                    $(this).dialog("close");
                },
                "No": function () {
                    $(this).dialog("close");
                }
            }
        });
    });
}

function sythechat_log(message) {
    if (sythechat_debugging) {
        var this_scrollback = $("#sythechat_debugging").find(".box_scrollback");
        this_scrollback.append('<div></div>').append(document.createTextNode(message));
        this_scrollback.scrollTop(this_scrollback[0].scrollHeight);
    }
}

function sythechat_dialog_error(error_text) {
    $("#sythechat_dialog_error").find("#error_text").html(error_text);
    $("#sythechat_dialog_error").dialog({
        resizable: false,
        width: 400,
        modal: true,
        buttons: {
            "Ok": function () {
                $(this).dialog("close");
            }
        }
    });
}

function sythechat_dialog_message(message_text) {
    $("#sythechat_dialog_message").find("#message_text").html(message_text);
    $("#sythechat_dialog_message").dialog({
        resizable: false,
        width: 400,
        modal: true,
        buttons: {
            "Ok": function () {
                $(this).dialog("close");
            }
        }
    });
}

function sythechat_save_settings() {
    var to_save = "";
    $("#sythechat_tab_settings").find("select").each(function () {
        to_save = to_save + (to_save.length > 0 ? "," : "") + $(this).attr("id") + "=" + $(this).val();
        eval("option_" + $(this).attr("id") + " = \"" + $(this).val() + "\";");
    });
    $.post("sythecore.php", {
        id: "save_settings",
        user_vars: to_save
    }).done(function (data) {
        sythechat_dialog_message(data);
    });
}

function sythechat_sort_list(list_object) {
    var list_items = list_object.children('li').get();
    list_items.sort(function (a, b) {
        var compA = $(a).text().toUpperCase();
        var compB = $(b).text().toUpperCase();
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    })
    $.each(list_items, function (idx, itm) {
        list_object.append(itm);
    });
}

function sythechat_change_status(status_code, status_text) {
    var status_update = $pres({
        'xmlns': "jabber:client"
    }).c('show', status_code).up().c('status', status_text);
    sythechat_connection.send(status_update);
}

function sythechat_contact_add(user_id) {
    if (user_id.indexOf(xmpp_domain) === -1) {
        user_id = user_id + "@" + xmpp_domain;
    }
    var iq = $iq({
        type: 'set'
    }).c('query', {
        xmlns: 'jabber:iq:roster'
    }).c('item', {
        jid: user_id
    });
    sythechat_connection.sendIQ(iq);
    var subscribe = $pres({
        to: user_id,
        "type": "subscribe"
    });
    sythechat_connection.send(subscribe);
}

function sythechat_contact_remove(user_id) {
    if (user_id.indexOf(xmpp_domain) === -1) {
        user_id = user_id + "@" + xmpp_domain;
    }
    $("#sythechat_dialog_contact_remove_confirm").dialog({
        resizable: false,
        width: 400,
        modal: true,
        buttons: {
            "Yes": function () {
                var iq = $iq({
                    type: 'set'
                }).c('query', {
                    xmlns: 'jabber:iq:roster'
                }).c('item', {
                    jid: user_id,
                    subscription: 'remove'
                });
                sythechat_connection.sendIQ(iq);
                $(this).dialog("close");
            },
            "No": function () {
                $(this).dialog("close");
            }
        }
    });
}

function sythechat_contact_approval(from_jid) {
    var simple_jid = Strophe.getNodeFromJid(from_jid);
    var approvals_list = $("#sythechat_approvals_list");
    if (approvals_list.find("#" + simple_jid).length == 0) {
        approvals_list.append('<li id="' + simple_jid + '"> ' + simple_jid + '</li>');
        sythechat_sort_list(approvals_list);
        var new_item = approvals_list.children("#" + simple_jid);
        new_item.prepend('<img id="' + simple_jid + '_deny" src="//img.sythe.org/chat/icons_small/cross.png" alt="Deny" title="Deny" /> ');
        new_item.find("#" + simple_jid + "_deny").click(function () {
            sythechat_contact_approve("deny", from_jid);
        });
        new_item.prepend('<img id="' + simple_jid + '_approve" src="//img.sythe.org/chat/icons_small/tick.png" alt="Approve" title="Approve" />');
        new_item.find("#" + simple_jid + "_approve").click(function () {
            sythechat_contact_approve("approve", from_jid);
        });
        new_item.hover(function () {
            $(this).addClass("hover");
        }, function () {
            $(this).removeClass("hover");
        });
        approvals_list.children("#list_empty").hide();
    }
}

function sythechat_contact_approve(approval_result, from_jid) {
    var simple_jid = Strophe.getNodeFromJid(from_jid);
    if (approval_result == "approve") {
        var response = $pres({
            to: from_jid,
            "type": "subscribed"
        });
        sythechat_connection.send(response);
        var subscribe = $pres({
            to: from_jid,
            "type": "subscribe"
        });
        sythechat_connection.send(subscribe);
    } else {
        var response = $pres({
            to: from_jid,
            "type": "unsubscribed"
        });
        sythechat_connection.send(response);
    }
    $("#sythechat_approvals_list").find("#" + simple_jid).remove();
    if ($("#sythechat_approvals_list").children().length == 1) {
        $("#sythechat_approvals_list").children("#list_empty").show();
    }
}

function sythechat_chatbox_create(target_jid, box_title, show_box) {
    if (target_jid.indexOf(xmpp_domain) === -1 && target_jid.indexOf(conference_service) === -1) {
        target_jid = target_jid + "@" + xmpp_domain;
    }
    var group_chat = (Strophe.getDomainFromJid(target_jid) == conference_service ? true : false);
    var jid_bare = Strophe.getBareJidFromJid(target_jid);
    var jid_node = Strophe.getNodeFromJid(target_jid);
    var jid_resource = Strophe.getResourceFromJid(target_jid);
    var this_box = (group_chat ? "group_" + jid_node : jid_node);
    if (box_title.length == 0) {
        box_title = jid_node;
    }
    if ($("#sythechat_chatarea").children("#" + this_box).length > 0) {
        if (!sythechat_chatbox_visible(this_box)) {
            sythechat_chatbox_show(this_box);
        }
    } else {
        $("#sythechat_chatarea").append('<div id="' + this_box + '" class="sythechat_box" data-box-jid="' + target_jid + '" data-box-type="' + (group_chat ? "groupchat" : "oneonone") + '" style="display: none;"></div>');
        var new_chatbox = $("#sythechat_chatarea").children("#" + this_box);
        new_chatbox.append('<div class="box_title"> ' + box_title + '</div>');
        new_chatbox.append('<div class="chat_menu"><ul class="chat_menu_list"></ul></div>');
        new_chatbox.find(".chat_menu_list").append('<li id="chat_menu_close">Close Chat</li>');
        new_chatbox.find(".chat_menu_list").find("#chat_menu_close").click(function () {
            $("#sythechat_dialog_chat_close_confirm").dialog({
                resizable: false,
                width: 400,
                modal: true,
                buttons: {
                    "Yes": function () {
                        if (group_chat) {
                            var leave_room = $pres({
                                to: jid_bare + "/" + Strophe.getNodeFromJid(sythechat_myjid),
                                "type": "unavailable"
                            });
                            sythechat_connection.send(leave_room);
                        }
                        sythechat_activechat_remove(jid_bare);
                        $(this).dialog("close");
                    },
                    "No": function () {
                        $(this).dialog("close");
                    }
                }
            });
            return false;
        });
        new_chatbox.find(".chat_menu_list").append('<li id="chat_menu_hide" onclick="">Hide Chat</li>');
        new_chatbox.find(".chat_menu_list").find("#chat_menu_hide").click(function () {
            if (group_chat) {
                $("#sythechat_tabs").children("data-target-jid['" + target_jid + "']").hide();
                $("#sythechat_tab_list").children("data-target-jid['" + target_jid + "']").hide();
                $("#sythechat_tabs").tabs("refresh");
                $("#sythechat_tabs").tabs("option", "active", 0);
            }
            new_chatbox.fadeOut();
        });
        if (group_chat) {
            new_chatbox.find(".chat_menu_list").append('<li id="chat_menu_subject" data-permission="moderator" onclick="sythechat_chatbox_setinput(\'' + this_box + '\', \'/subject new subject\');">Change Subject</li>');
            new_chatbox.find(".chat_menu_list").append('<li id="chat_menu_kick" data-permission="moderator" onclick="sythechat_chatbox_setinput(\'' + this_box + '\', \'/kick username optional reason\');">Kick User</li>');
            new_chatbox.find(".chat_menu_list").append('<li id="chat_menu_invite" onclick="sythechat_conference_invite(\'' + target_jid + '\');">Invite User</li>');
            new_chatbox.find(".chat_menu_list").append('<li id="chat_menu_pm" onclick="sythechat_chatbox_setinput(\'' + this_box + '\', \'/pm username the message\');">Send PM</li>');
        } else {
            new_chatbox.find(".chat_menu_list").append('<li id="chat_menu_contact_remove" onclick="sythechat_contact_remove(\'' + jid_node + '\');">Remove Contact</li>');
        }
        new_chatbox.find(".chat_menu_list").children("li").hover(function () {
            $(this).addClass("hover");
        }, function () {
            $(this).removeClass("hover");
        });
        new_chatbox.append('<div class="box_scrollback"></div>');
        new_chatbox.append('<div class="box_input"><input type="text" placeholder="Type your message here..." /><button>Send</button></div>');
        new_chatbox.find("#close_button").click(function () {
            if (group_chat) {
                $("#sythechat_tabs").children("#" + this_box).remove();
                $("#sythechat_tab_list").children("#" + this_box + "_li").remove();
                $("#sythechat_tabs").tabs("refresh");
                $("#sythechat_tabs").tabs("option", "active", 0);
            }
            new_chatbox.fadeOut("", function () {
                new_chatbox.remove();
            });
        });
        new_chatbox.find("button").click(function (e) {
            sythechat_send_message(this_box, new_chatbox.find("input").val());
            new_chatbox.find("input").val("");
            if (!group_chat) {
                new_chatbox.data("composing", false);
            }
        });
        new_chatbox.find("input").keypress(function (e) {
            if (e.which == 13) {
                sythechat_send_message(this_box, $(this).val());
                $(this).val("");
                if (!group_chat) {
                    $(this).parent().data("composing", false);
                }
            } else if (!group_chat) {
                var composing = $(this).parent().data("composing");
                if (!composing) {
                    var notify = $msg({
                        to: target_jid,
                        "type": "chat"
                    }).c('composing', {
                        xmlns: "http://jabber.org/protocol/chatstates"
                    });
                    sythechat_connection.send(notify);
                    $(this).parent().data("composing", true);
                }
            }
        });
        if (group_chat) {
            $("#sythechat_tab_list").append('<li id="' + this_box + '_li" data-box-jid="' + target_jid + '" data-tab-type="participants" style="display: none;"><a href="#' + this_box + '"><img src="//img.sythe.org/chat/icons_large/group.png" width="32" height="32" alt="Participants" title="Participants" /></a></li>');
            $("#sythechat_tabs").append('<div id="' + this_box + '" data-box-jid="' + target_jid + '" data-tab-type="participants" style="display: none;"></div>');
            var new_tab = $("#sythechat_tabs").children("#" + this_box);
            new_tab.append('<div class="sythechat_panel"></div>');
            new_tab.find(".sythechat_panel").append('<h3>Participants</h3>');
            new_tab.find(".sythechat_panel").append('<ul id="' + this_box + '_list" class="sythechat_list"></ul>');
            new_tab.find(".sythechat_list").append('<li id="list_empty"><em>No Participants</em></li>');
            new_chatbox.attr("data-tab-name", this_box);
            $("#sythechat_tabs").tabs("refresh");
        }
        if (show_box) {
            sythechat_chatbox_show(this_box);
        }
        sythechat_activechat_add(target_jid, box_title);
    }
}

function sythechat_chatbox_setinput(the_box, the_text) {
    $("#sythechat_chatarea").children("#" + the_box).find("input").val(the_text);
}

function sythechat_chatbox_visible(the_box) {
    return $("#sythechat_chatarea").children("#" + the_box).is(":visible");
}

function sythechat_chatbox_show(box_to_top) {
    var group_chat = ($("#sythechat_chatarea").children("#" + box_to_top).attr("data-box-type") == "groupchat" ? true : false);
    var box_target = $("#sythechat_chatarea").children("#" + box_to_top).attr("data-box-jid");
    $("#sythechat_chatarea").children(".sythechat_box").not("#" + box_to_top).hide();
    $("#sythechat_tabs").find("[data-tab-type='participants']").hide();
    $("#sythechat_tabs").find("[data-tab-type='settings']").hide();
    if (group_chat) {
        var tab_name = $("#sythechat_chatarea").children("#" + box_to_top).attr("data-tab-name");
        $("#sythechat_tabs").find("[data-box-jid='" + box_target + "']").show();
        var tab_index = $("#sythechat_tabs").find("[data-box-jid='" + box_target + "']").find("[data-tab-type='settings']").index();
        $("#sythechat_tabs").tabs("option", "active", tab_index);
    } else {
        $("#sythechat_tabs").tabs("option", "active", 0);
    }
    $("#sythechat_tabs").tabs("refresh");
    $("#sythechat_chatarea").children("#" + box_to_top).fadeIn("", function () {
        var this_scrollback = $(this).find(".box_scrollback");
        this_scrollback.scrollTop(this_scrollback[0].scrollHeight);
        $(this).find("input").focus();
    });
}

function sythechat_conference_join(room_name) {
    var conference_box = "group_" + room_name;
    if (room_name.indexOf(conference_service) !== -1) {
        room_name = room_name.replace(conference_service, "");
    }
    if ($("#sythechat_chatarea").children("#" + conference_box).length > 0) {
        sythechat_chatbox_show(conference_box);
    } else {
        var simple_jid = Strophe.getNodeFromJid(sythechat_myjid);
        var simple_room = room_name;
        var iq = $iq({
            to: simple_room + "@" + conference_service,
            type: 'get'
        }).c('query', {
            xmlns: 'http://jabber.org/protocol/disco#info'
        });
        var callback_success = function (response_iq) {
            var join_room = $pres({
                to: simple_room + "@" + conference_service + "/" + simple_jid
            }).c('x', {
                xmlns: 'http://jabber.org/protocol/muc'
            });
            sythechat_connection.send(join_room);
        };
        var callback_failure = function (response_iq) {
            if ($(response_iq).find('error').attr('code') == "404") {
                sythechat_dialog_error('Room "' + room_name + '" does not exist!');
            } else {
                sythechat_dialog_error("Error Code: " + $(response_iq).find('error').attr('code'));
            }
        };
        sythechat_connection.sendIQ(iq, callback_success, callback_failure);
    }
}

function sythechat_conference_create(room_name) {
    if (room_name.indexOf(conference_service) !== -1) {
        room_name = room_name.replace(conference_service, "");
    }
    var simple_jid = Strophe.getNodeFromJid(sythechat_myjid);
    var create_room = $pres({
        to: room_name + "@" + conference_service + "/" + simple_jid
    }).c('x', {
        xmlns: 'http://jabber.org/protocol/muc'
    });
    sythechat_connection.send(create_room);
}

function sythechat_conference_instant(room_jid) {
    var iq = $iq({
        to: room_jid,
        type: 'set'
    }).c('query', {
        xmlns: 'http://jabber.org/protocol/muc#owner'
    }).c('x', {
        xmlns: 'jabber:x:data',
        'type': 'submit'
    });
    var iq_id = sythechat_connection.sendIQ(iq);
}

function sythechat_conference_config_save(room_jid) {
    var tab_name = "group_" + Strophe.getNodeFromJid(room_jid) + "_settings";
    var config_room = $iq({
        to: room_jid,
        "type": "set"
    }).c("query", {
        "xmlns": "http://jabber.org/protocol/muc#owner"
    }).c("x", {
        "xmlns": "jabber:x:data",
        "type": "submit"
    });
    $("#sythechat_tabs").children("#" + tab_name).find("input, select, textarea").each(function () {
        var field_id = $(this).attr("id");
        config_room.c("field", {
            "var": field_id
        });
        if ($(this).attr("multiple")) {
            var field_values = $(this).val() || [];
            for (var i = 0; i < field_values.length; i++) {
                config_room.c("value").t(field_values[i]).up();
            }
        } else {
            if ($(this).attr("data-type") == "jid-multi" && $(this).val().indexOf(",") >= 0) {
                var split_jids = $(this).val().split(",");
                for (var i = 0; i < split_jids.length; i++) {
                    config_room.c("value").t(split_jids[i]).up();
                }
            } else {
                config_room.c("value").t("" + $(this).val()).up();
            }
        }
        config_room.up();
    });
    sythechat_connection.sendIQ(config_room, function (reply_iq) {
        if ($(reply_iq).attr("type") == "result") {
            $("#sythechat_tabs").tabs("option", "active", $("#sythechat_tab_list").find("a[href='#" + tab_name + "']").parent().index());
        }
    });
}

function sythechat_conference_cancel(room_jid) {
    var leave_room = $pres({
        to: room_jid + "/" + Strophe.getNodeFromJid(sythechat_myjid),
        "type": "unavailable"
    });
    sythechat_connection.send(leave_room);
}

function sythechat_conference_invite(room_jid) {
    var invite_function = function (user_id) {
        if (user_id.length > 2) {
            $("#sythechat_dialog_conference_invite").find("#user_id").val("");
            if (user_id.indexOf(xmpp_domain) === -1) {
                user_id = user_id + "@" + xmpp_domain;
            }
            new_message = $msg({
                to: room_jid
            }).c('x', {
                xmlns: 'http://jabber.org/protocol/muc#user'
            }).c('invite', {
                'to': user_id
            });
            sythechat_connection.send(new_message);
        } else {
            sythechat_dialog_error("Sorry, that user was not valid.");
        }
    };
    $("#sythechat_dialog_conference_invite").dialog({
        resizable: false,
        width: 400,
        modal: true,
        buttons: {
            "Invite": function () {
                invite_function($("#sythechat_dialog_conference_invite").find("#user_id").val());
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
    $("#sythechat_dialog_conference_invite").find("#user_id").keypress(function (e) {
        if (e.which == 13) {
            invite_function($(this).val());
            $(this).val("");
            $("#sythechat_dialog_conference_invite").dialog("close");
        }
    });
}

function sythechat_conference_oninvitation(room_jid, user_jid) {
    var short_room_jid = Strophe.getNodeFromJid(room_jid);
    var short_from_jid = Strophe.getNodeFromJid(user_jid);
    $("#invitation_text").html(short_from_jid + " has invited you to the room " + short_room_jid + ". Would you like to join?");
    $("#sythechat_dialog_conference_invitation").dialog({
        resizable: false,
        width: 400,
        modal: true,
        buttons: {
            "Yes": function () {
                sythechat_conference_join(short_room_jid);
                $(this).dialog("close");
            },
            "No": function () {
                new_message = $msg({
                    to: room_jid
                }).c('x', {
                    xmlns: 'http://jabber.org/protocol/muc#user'
                }).c('decline', {
                    'to': user_jid
                });
                sythechat_connection.send(new_message);
                $(this).dialog("close");
            }
        }
    });
}

function sythechat_activechat_add(chat_jid, chat_name) {
    var simple_jid = Strophe.getNodeFromJid(chat_jid);
    var group_chat = (Strophe.getDomainFromJid(chat_jid) == conference_service ? true : false);
    var chat_id = (group_chat ? "group_" + simple_jid : simple_jid);
    if ($("#sythechat_activechats_list").children("#" + chat_id + "_li").length == 0) {
        if (group_chat) {
            chat_name = "(G) " + chat_name;
        }
        $("#sythechat_activechats_list").append('<li id="' + chat_id + '_li">' + chat_name + '</li>');
        sythechat_sort_list($("#sythechat_activechats_list"));
        $("#sythechat_activechats_list").children("#" + chat_id + "_li").hover(function () {
            $(this).addClass("hover");
        }, function () {
            $(this).removeClass("hover");
        });
        $("#sythechat_activechats_list").children("#" + chat_id + "_li").click(function () {
            $(this).removeClass("new_message");
            sythechat_chatbox_create(chat_jid, chat_name, true);
        });
        $("#sythechat_activechats_list").children("#list_empty").hide();
    }
}

function sythechat_activechat_remove(chat_jid) {
    var simple_jid = Strophe.getNodeFromJid(chat_jid);
    var group_chat = (Strophe.getDomainFromJid(chat_jid) == conference_service ? true : false);
    var chat_id = (group_chat ? "group_" + simple_jid : simple_jid);
    if ($("#sythechat_chatarea").children("#" + chat_id).length > 0) {
        $("#sythechat_chatarea").children("#" + chat_id).remove();
    }
    if ($('#sythechat_activechats_list').children("#" + chat_id + "_li").length > 0) {
        $('#sythechat_activechats_list').children("#" + chat_id + "_li").remove();
    }
    if (group_chat) {
        $("#sythechat_tabs").find("[data-box-jid='" + chat_jid + "']").remove();
        $("#sythechat_tab_list").find("[data-box-jid='" + chat_jid + "']").remove();
        $("#sythechat_tabs").tabs("refresh");
        $("#sythechat_tabs").tabs("option", "active", 0);
    }
    if ($("#sythechat_activechats_list").children().length == 1) {
        $("#sythechat_activechats_list").children("#list_empty").show();
    }
}

function sythechat_connect(user_jid, user_pass) {
    if (user_jid.indexOf(xmpp_domain) === -1) {
        user_jid = user_jid + "@" + xmpp_domain;
    }
    sythechat_connection.connect(user_jid + "/sythechatweb", user_pass, sythechat_onconnect);
    sythechat_myjid = user_jid;
    $("#user_jid_display").html(Strophe.getNodeFromJid(sythechat_myjid));
}

function sythechat_disconnect() {
    $("#sythechat_chatarea").children().not($("#sythechat_debugging")).remove();
    sythechat_connection.disconnect();
}

function sythechat_onconnect(connection_status) {
    if (connection_status == Strophe.Status.CONNECTING) {
        sythechat_log('Strophe is connecting.');
        $("#sythechat_login_connect").prop("disabled", "true");
        $("#sythechat_status_indicator").attr('class', 'sythechat_offline_indicator');
        $("#sythechat_login_messages").html("").hide();
    } else if (connection_status == Strophe.Status.CONNFAIL) {
        sythechat_log('Strophe failed to connect.');
        sythechat_myjid = null;
        $("#user_jid_display").html("SytheChat");
        sythechat_intercom = null;
        $("#sythechat_login_connect").removeAttr("disabled");
        $("#sythechat_status_indicator").attr('class', 'sythechat_offline_indicator');
    } else if (connection_status == Strophe.Status.ERROR) {
        sythechat_log('Strophe encountered an error connecting.');
        sythechat_myjid = null;
        $("#user_jid_display").html("SytheChat");
        sythechat_intercom = null;
        $("#sythechat_login_connect").removeAttr("disabled");
        $("#sythechat_status_indicator").attr('class', 'sythechat_offline_indicator');
        $("#sythechat_login_messages").html("Could not connect to SytheChat.");
        $("#sythechat_login_messages").show();
    } else if (connection_status == Strophe.Status.DISCONNECTING) {
        sythechat_log('Strophe is disconnecting.');
        sythechat_myjid = null;
        $("#user_jid_display").html("SytheChat");
        sythechat_intercom = null;
        $("#sythechat_login_connect").removeAttr("disabled");
        $("#sythechat_status_indicator").attr('class', 'sythechat_offline_indicator');
        $(".show_online").fadeOut(function () {
            $(".show_offline").fadeIn();
        });
    } else if (connection_status == Strophe.Status.DISCONNECTED) {
        sythechat_log('Strophe is disconnected.');
        sythechat_myjid = null;
        $("#user_jid_display").html("SytheChat");
        sythechat_intercom = null;
        $("#sythechat_approvals_list").children("#list_empty").show();
        $("#sythechat_approvals_list").children().not("#list_empty").remove();
        $("#sythechat_activechats_list").children("#list_empty").show();
        $("#sythechat_activechats_list").children().not("#list_empty").remove();
        $("#sythechat_contacts_list").children("#list_empty").show();
        $("#sythechat_contacts_list").children().not("#list_empty").remove();
        $("#sythechat_login_connect").removeAttr("disabled");
        $("#sythechat_status_indicator").attr('class', 'sythechat_offline_indicator');
        $(".show_online").fadeOut(function () {
            $(".show_offline").fadeIn();
        });
    } else if (connection_status == Strophe.Status.CONNECTED || connection_status == Strophe.Status.ATTACHED) {
        sythechat_log('Strophe is connected.');
        $("#sythechat_login_connect").prop("disabled", "true");
        $("#sythechat_status_indicator").attr('class', 'sythechat_online_indicator');
        $(".show_offline").fadeOut(function () {
            $(".show_online").fadeIn();
        });
        sythechat_connection.addHandler(sythechat_roster_onchange, "jabber:iq:roster", "iq");
        sythechat_connection.addHandler(sythechat_onpresence, null, "presence");
        sythechat_connection.addHandler(sythechat_onmessage, null, "message", "chat");
        sythechat_connection.addHandler(sythechat_ongroupmessage, null, "message", "groupchat");
        sythechat_connection.addHandler(sythechat_oniqresult, "jabber:client", "iq", "result");
        sythechat_connection.addHandler(sythechat_onerror, "jabber:iq", "iq", "error");
        sythechat_connection.addHandler(sythechat_onerror, null, "message", "error");
        sythechat_roster_get();
        if (Intercom.supported) {
            sythechat_intercom = new Intercom();
            sythechat_intercom.on('sythechat_action', sythechat_onintercom);
            setInterval(function () {
                sythechat_intercom.emit("sythechat_is_alive", Date.now() + "");
            }, 1000);
        } else {}
        sythechat_connection.send($pres());
        if (option_setting_lobbyjoin == "1") {
            sythechat_conference_join("sythe-lobby");
        }
        if (sythechat_init_join) {
            sythechat_conference_join(sythechat_init_join);
        }
        if (sythechat_init_chat) {
            sythechat_chatbox_create(sythechat_init_chat, '', true);
        }
    }
    return true;
}

function sythechat_onintercom(data) {
    data.action = (data.action ? data.action : "");
    switch (data.action) {
    case "chat":
        if (data.target) {
            window.focus();
            sythechat_chatbox_create(data.target, '', true);
        }
        break;
    case "groupchat":
        if (data.target) {
            window.focus();
            sythechat_conference_join(data.target);
        }
        break;
    }
}

function sythechat_oniqresult(iq_object) {
    if ($(iq_object).find("x[type='form']").length > 0) {
        var iq_origin = $(iq_object).attr("from");
        var group_chat = (Strophe.getDomainFromJid(iq_origin) == conference_service ? true : false);
        if (group_chat) {
            var chat_name = Strophe.getNodeFromJid(iq_origin);
            var tab_name = 'group_' + chat_name + '_settings';
            if ($("#sythechat_tabs").children("#" + tab_name).length == 0) {
                $("#sythechat_tabs").append('<div id="' + tab_name + '" data-box-jid="' + iq_origin + '" data-tab-type="settings"><div class="sythechat_panel" style="font-size: 12px;"><h3>Conference Settings</h3></div></div>');
                var new_tab = $("#sythechat_tabs").children("#" + tab_name).children(".sythechat_panel");
                new_tab.append('<button id="instant_room" style="width: 60%;" onclick="sythechat_conference_instant(\'' + iq_origin + '\');">Instant Room</button>');
                $(iq_object).find("field").each(function () {
                    var field_label = $(this).attr('label');
                    var field_type = $(this).attr('type');
                    var field_var = $(this).attr('var');
                    var default_value = ($(this).children("value").text() ? $(this).children("value").text() : "");
                    var field_html = "";
                    switch (field_type) {
                    case "hidden":
                        field_html = '<input type="hidden" name="' + field_var + '" id="' + field_var + '" value="' + default_value + '" />';
                        break;
                    case "text-single":
                        field_html = '<input type="text" name="' + field_var + '" id="' + field_var + '" value="' + default_value + '" size="25" />';
                        break;
                    case "text-private":
                        field_html = '<input type="password" name="' + field_var + '" id="' + field_var + '" value="' + default_value + '" size="25" />';
                        break;
                    case "jid-multi":
                        field_html = '(Comma separated)<br /><input type="text" name="' + field_var + '" id="' + field_var + '" value="' + default_value + '" size="25" />';
                        break;
                    case "boolean":
                        field_html = '<select name="' + field_var + '" id="' + field_var + '"><option value="1"' + (default_value == "1" ? " SELECTED" : "") + '>Yes</option><option value="0"' + (default_value == "0" ? " SELECTED" : "") + '>No</option></select>';
                        break;
                    case "list-single":
                        field_html = '<select name="' + field_var + '" id="' + field_var + '">';
                        $(this).find("option").each(function () {
                            field_html = field_html + '<option value="' + $(this).children("value").text() + '"' + ($(this).children("value").text() == default_value ? " SELECTED" : "") + '>' + $(this).attr('label') + '</option>';
                        });
                        field_html = field_html + '</select>';
                        break;
                    case "list-multi":
                        field_html = '<select multiple name="' + field_var + '" id="' + field_var + '">';
                        $(this).find("option").each(function () {
                            field_html = field_html + '<option value="' + $(this).children("value").text() + '"' + ($(this).children("value[text='" + default_value + "']") ? " SELECTED" : "") + '>' + $(this).attr('label') + '</option>';
                        });
                        field_html = field_html + '</select>';
                        break;
                    }
                    if (field_html.length > 0) {
                        if (field_type == "hidden") {
                            new_tab.append(field_html);
                        } else {
                            new_tab.append('<br />' + field_label + ':<br />' + field_html);
                        }
                    }
                });
                new_tab.append('<br /><br /><button id="save_settings" style="width: 30%;" onclick="sythechat_conference_config_save(\'' + iq_origin + '\');">Save</button> <button id="cancel_settings" style="width: 30%;" onclick="sythechat_conference_cancel(\'' + iq_origin + '\');">Cancel</button>');
                $("#sythechat_tab_list").append('<li data-box-jid="' + iq_origin + '" data-tab-type="settings"><a href="#' + tab_name + '"><img src="//img.sythe.org/chat/icons_large/group_gear.png" alt="Conference Settings" title="Conference Settings" /></a></li>');
                $("#sythechat_tabs").tabs("refresh");
                if (!sythechat_chatbox_visible("group_" + chat_name)) {
                    sythechat_chatbox_show("group_" + chat_name);
                    $("#sythechat_tabs").tabs("option", "active", $("#sythechat_tab_list").find("[data-box-jid='" + iq_origin + "']").find("[data-tab-type='settings']").index());
                }
            }
        }
    }
    return true;
}

function sythechat_onerror(error_object) {
    var error_origin = $(error_object).attr("from");
    var group_chat = (Strophe.getDomainFromJid(error_origin) == conference_service ? true : false);
    if (group_chat) {
        if ($(error_object).find("error[code='403']").length > 0 || $(error_object).find("forbidden").length > 0) {
            sythechat_send_message("group_" + Strophe.getNodeFromJid(error_origin), "Sorry, you don't have permission to do that! [forbidden]", "system");
        }
        if ($(error_object).find("error[code='405']").length > 0 || $(error_object).find("not-allowed").length > 0) {
            sythechat_send_message("group_" + Strophe.getNodeFromJid(error_origin), "Sorry, you don't have permission to do that! [not-allowed]", "system");
        }
        if ($(error_object).find("error[code='400']").length > 0 || $(error_object).find("jid-malformed").length > 0) {
            sythechat_send_message("group_" + Strophe.getNodeFromJid(error_origin), "The JID provided is not valid! [jid-malformed]", "system");
        }
    } else {
        if ($(error_object).find("error[code='400']").length > 0 || $(error_object).find("jid-malformed").length > 0) {
            sythechat_send_message(Strophe.getNodeFromJid(error_origin), "The JID provided is not valid! [jid-malformed]", "system");
        }
    }
    return true;
}

function sythechat_rawinput(data) {
    sythechat_log('RECV: ' + data);
    if (data.indexOf("<not-authorized/>") >= 0) {
        $("#sythechat_login_connect").removeAttr("disabled");
        $("#sythechat_login_messages").html("Authentication Failed").show();
        sythechat_disconnect();
    }
}

function sythechat_rawoutput(data) {
    sythechat_log('SENT: ' + data);
}

function sythechat_onpresence(presence) {
    var presence_type = $(presence).attr("type");
    var presence_from = $(presence).attr("from");
    var presence_toresource = Strophe.getResourceFromJid($(presence).attr("to"));
    var group_chat = (Strophe.getDomainFromJid(presence_from) == conference_service ? true : false);
    if (group_chat) {
        var chat_jid = Strophe.getBareJidFromJid(presence_from);
        var chat_name = Strophe.getNodeFromJid(chat_jid);
        var chat_user = Strophe.getResourceFromJid(presence_from);
        var this_box = "group_" + chat_name;
        if ($("#sythechat_chatarea").children("#" + this_box).length == 0 && presence_type != "unavailable") {
            sythechat_chatbox_create(chat_jid, chat_name, true);
        }
        if ($(presence).find("status[code='201']").length > 0) {
            var iq = $iq({
                to: chat_jid,
                type: 'get'
            }).c('query', {
                xmlns: 'http://jabber.org/protocol/muc#owner'
            });
            sythechat_connection.sendIQ(iq);
        }
        if ($(presence).find("status[code='307']").length > 0) {
            if (chat_user == Strophe.getNodeFromJid(sythechat_myjid)) {
                var kick_message = "You were kicked from the chat " + Strophe.getNodeFromJid(chat_jid) + " by " + Strophe.getNodeFromJid($(presence).find("actor").attr("jid")) + "!";
                if ($(presence).find("reason").length > 0) {
                    kick_message = kick_message + "<br />Reason: " + $(presence).find("reason").text();
                }
                sythechat_dialog_message(kick_message);
            } else {
                var the_participants = $("#sythechat_tabs").find("#" + this_box).find("#" + this_box + "_list");
                if (the_participants.find("#" + chat_user).length > 0) {
                    var kick_message = chat_user + " was kicked from the room.";
                    sythechat_send_message(this_box, kick_message, "system");
                }
            }
        }
        if ($(presence).find("item[affiliation]").length > 0) {
            $(presence).find("item[affiliation]").each(function () {
                var the_user = Strophe.getNodeFromJid($(this).attr('jid'));
                var user_jid = Strophe.getBareJidFromJid($(this).attr('jid'));
                var the_resource = Strophe.getResourceFromJid($(this).attr('jid'));
                var the_affiliation = $(this).attr('affiliation');
                var the_role = $(this).attr('role');
                var chat_name = Strophe.getNodeFromJid(presence_from);
                var the_box = "group_" + chat_name;
                var the_participants = $("#sythechat_tabs").find("#" + the_box).find("#" + the_box + "_list");
                if (Strophe.getBareJidFromJid($(this).attr('jid')) == sythechat_myjid && the_resource == presence_toresource) {
                    if (the_affiliation == "owner") {
                        var iq = $iq({
                            to: chat_jid,
                            type: 'get'
                        }).c('query', {
                            xmlns: 'http://jabber.org/protocol/muc#owner'
                        });
                        sythechat_connection.sendIQ(iq);
                    }
                    if (the_role == "moderator") {
                        $("#sythechat_chatarea").children("#" + the_box).find("li[data-permission='moderator']").show();
                    } else {
                        $("#sythechat_chatarea").children("#" + the_box).find("li[data-permission='moderator']").hide();
                    }
                    if (presence_type == "unavailable") {
                        sythechat_activechat_remove(chat_jid);
                    }
                }
                if ($("#sythechat_chatarea").find("#" + the_box).length > 0) {
                    if (the_role == "none") {
                        if (the_participants.find("#" + the_user).length > 0) {
                            if (option_setting_joinleave == "1") {
                                sythechat_send_message(the_box, the_user + " has left the room!", "system");
                            }
                            the_participants.find("#" + the_user).remove();
                        }
                    } else {
                        if (option_setting_joinleave == "1" && the_participants.find("#" + the_user).length <= 0) {
                            sythechat_send_message(the_box, the_user + " has joined the room!", "system");
                        }
                        var user_icon = "";
                        if (the_role == "moderator") {
                            user_icon = '<img src="//img.sythe.org/chat/icons_small/user_red.png" alt="Moderator" title="Moderator" />';
                        } else if (the_role == "participant") {
                            user_icon = '<img src="//img.sythe.org/chat/icons_small/user_green.png" alt="Participant" title="Participant" />';
                        } else {
                            user_icon = '<img src="//img.sythe.org/chat/icons_small/user_gray.png" alt="Visitor" title="Visitor" />';
                        }
                        var this_presence = $(this).parents("presence");
                        var show_state = this_presence.find("show").text();
                        var show_status = this_presence.find("status").text();
                        if (show_status.length > 0) {
                            show_status = " [" + show_status + "]";
                        }
                        if (show_state == "away" || show_state == "xa") {
                            user_icon = '<img src="//img.sythe.org/chat/icons_small/status_away.png" alt="Away" title="Away" />';
                            sythechat_send_message(the_box, the_user + " is now away." + show_status, "system");
                        } else if (show_state == "dnd") {
                            user_icon = '<img src="//img.sythe.org/chat/icons_small/status_busy.png" alt="Busy" title="Busy" />';
                            sythechat_send_message(the_box, the_user + " is now busy." + show_status, "system");
                        }
                        if (the_participants.find("#" + the_user).length == 0) {
                            the_participants.append('<li id="' + the_user + '" data-jid="' + $(this).attr('jid') + '">' + user_icon + ' ' + the_user + '</li>');
                            sythechat_sort_list(the_participants);
                            the_participants.find("#" + the_user).hover(function () {
                                $(this).addClass("hover");
                            }, function () {
                                $(this).removeClass("hover");
                            });
                            the_participants.find("#" + the_user).click(function () {
                                sythechat_chatbox_create(user_jid, the_user, true);
                            });
                        } else {
                            the_participants.find("#" + the_user).find("img").replaceWith(user_icon);
                        }
                    }
                    if (the_participants.children().length == 1) {
                        the_participants.children("#list_empty").show();
                    } else {
                        the_participants.children("#list_empty").hide();
                    }
                }
            });
        }
    } else {
        var user_node = Strophe.getNodeFromJid(presence_from);
        if (presence_type == "subscribe") {
            sythechat_contact_approval(presence_from);
        } else if (presence_type == "error") {
            sythechat_dialog_error("There was an error adding " + presence_from + ".");
        } else {
            var roster_item = $('#sythechat_contacts_list').find("#" + user_node).removeClass('offline').removeClass('online').removeClass('away');
            if (presence_type == 'unavailable') {
                roster_item.addClass("offline");
                $("#" + user_node).find("#contact_status").attr("src", "//img.sythe.org/chat/icons_small/status_offline.png");
                sythechat_send_message(user_node, user_node + " is now offline.", "system");
            } else {
                var show_state = $(presence).find("show").text();
                var show_status = $(presence).find("status").text();
                if (show_status.length > 0) {
                    show_status = " [" + show_status + "]";
                }
                if (show_state == "away" || show_state == "xa") {
                    roster_item.addClass("away");
                    roster_item.find("#contact_status").attr("src", "//img.sythe.org/chat/icons_small/status_away.png");
                    sythechat_send_message(user_node, user_node + " is now away." + show_status, "system");
                } else if (show_state == "dnd") {
                    roster_item.addClass("away");
                    roster_item.find("#contact_status").attr("src", "//img.sythe.org/chat/icons_small/status_busy.png");
                    sythechat_send_message(user_node, user_node + " is now busy." + show_status, "system");
                } else {
                    roster_item.addClass("online");
                    roster_item.find("#contact_status").attr("src", "//img.sythe.org/chat/icons_small/status_online.png");
                    sythechat_send_message(user_node, user_node + " is now online." + show_status, "system");
                }
            }
        }
    }
    return true;
}

function sythechat_roster_get() {
    var iq = $iq({
        type: 'get'
    }).c('query', {
        xmlns: 'jabber:iq:roster'
    });
    sythechat_connection.sendIQ(iq);
}

function sythechat_roster_onchange(roster_iq) {
    $(roster_iq).find('item').each(function () {
        var user_jid = $(this).attr('jid');
        var user_name = $(this).attr('name') || Strophe.getNodeFromJid(user_jid);
        var sub_type = $(this).attr('subscription');
        if (sub_type == 'remove') {
            sythechat_roster_user_remove(user_jid);
        } else if (sub_type != 'none') {
            sythechat_roster_user_add(user_jid, user_name);
        }
    });
    return true;
};

function sythechat_roster_user_add(user_jid, user_name) {
    if (user_jid.indexOf(xmpp_domain) === -1) {
        user_jid = user_jid + "@" + xmpp_domain;
    }
    var simple_jid = Strophe.getNodeFromJid(user_jid);
    if ($('#sythechat_contacts_list').find("#" + simple_jid).length == 0) {
        $("#sythechat_contacts_list").append('<li id="' + simple_jid + '" class="offline"> ' + user_name + '</li>');
        sythechat_sort_list($("#sythechat_contacts_list"));
        var new_item = $("#sythechat_contacts_list").children("#" + simple_jid);
        new_item.prepend('<img id="contact_status" src="//img.sythe.org/chat/icons_small/status_offline.png" />');
        new_item.hover(function () {
            $(this).addClass("hover");
        }, function () {
            $(this).removeClass("hover");
        });
        new_item.click(function () {
            sythechat_chatbox_create(user_jid, user_name, true);
        });
        $("#sythechat_contacts_list").children("#list_empty").hide();
    }
}

function sythechat_roster_user_remove(user_jid) {
    if (user_jid.indexOf(xmpp_domain) === -1) {
        user_jid = user_jid + "@" + xmpp_domain;
    }
    var simple_jid = Strophe.getNodeFromJid(user_jid);
    $("#sythechat_contacts_list").children("#" + simple_jid).remove();
    if ($("#sythechat_contacts_list").children().length == 1) {
        $("#sythechat_contacts_list").children("#list_empty").show();
    }
}

function sythechat_send_message(the_box, message_text, message_type) {
    if ($("#sythechat_chatarea").children("#" + the_box).length > 0) {
        var target_jid = $("#sythechat_chatarea").children("#" + the_box).attr("data-box-jid");
        var group_chat = (Strophe.getDomainFromJid(target_jid) == conference_service ? true : false);
        if (!message_type) {
            message_type = "";
        }
        var local_only = false;
        var css_class = message_type;
        if (message_type == "system") {
            message_text = '<span class="username">*SYSTEM*</span>: ' + message_text;
            local_only = true;
        } else if (message_type == "private") {
            local_only = true;
        }
        if (message_text.length > 0) {
            var new_message = null;
            if (message_text.indexOf("/") == 0) {
                if (group_chat) {
                    sythechat_parse_commands(the_box, message_text);
                } else {
                    sythechat_send_message(the_box, "Sorry, you can't use commands in one-on-one chats!", "system");
                }
            } else {
                if (!local_only) {
                    if (group_chat) {
                        new_message = $msg({
                            to: target_jid,
                            "type": "groupchat"
                        }).c("body").t(message_text);
                    } else {
                        new_message = $msg({
                            to: target_jid,
                            "type": "chat"
                        }).c("body").t(message_text);
                    }
                    sythechat_connection.send(new_message);
                }
                var scrollback_div = $("#sythechat_chatarea").children("#" + the_box).find(".box_scrollback");
                message_text = sythechat_process_parsables(message_text);
                message_text = sythechat_process_emoticons(message_text);
                var date_obj = new Date();
                var human_time = ((date_obj.getHours() < 10) ? "0" + date_obj.getHours() : date_obj.getHours()) + ":" + ((date_obj.getMinutes() < 10) ? "0" + date_obj.getMinutes() : date_obj.getMinutes());
                if (group_chat) {
                    if (local_only) {
                        scrollback_div.append('<div class="group_message" from-jid="*SYSTEM*"></div>');
                        scrollback_div.find(".group_message").last().append('<div' + (css_class ? ' class="' + css_class + '"' : "") + '><span class="message_time">[' + human_time + ']</span> ' + message_text + '</div>');
                    }
                } else {
                    if (scrollback_div.find(".message").last().attr("from-jid") == "me") {
                        scrollback_div.find(".message").last().find(".message_block").append('<div><span class="message_time">[' + human_time + ']</span> ' + message_text + '</div>');
                    } else {
                        scrollback_div.append('<div class="message" from-jid="me"></div>');
                        scrollback_div.find(".message").last().append('<img src="//img.sythe.org/chat/icons_small/user.png" class="user_icon" />');
                        scrollback_div.find(".message").last().append('<div class="message_block"><div' + (css_class ? ' class="' + css_class + '"' : "") + '><span class="message_time">[' + human_time + ']</span> ' + message_text + '</div></div>');
                    }
                }
            }
        }
    }
}

function sythechat_parse_commands(the_box, message_text) {
    message_text = message_text.substring(1);
    var command_parts = message_text.split(" ", 3);
    var operand_one = "";
    var operand_two = "";
    var command_name = command_parts[0];
    var myregexp = /^([^ \r\n]+) +([^ \r\n]+)([^\r\n]+)?$/m;
    var match = myregexp.exec(message_text);
    if (match != null && match.length > 1) {
        command_name = match[1];
        if (match.length > 2) operand_one = match[2];
        if (match.length > 3) operand_two = match[3];
    }
    var target_jid = $("#sythechat_chatarea").children("#" + the_box).attr("data-box-jid");
    switch (command_name) {
    case "pm":
        var pm_user = operand_one;
        var pm_text = operand_two;
        if (pm_user.length >= 1 && pm_text.length >= 1) {
            var new_message = $msg({
                to: target_jid + "/" + pm_user,
                "type": "chat"
            }).c("body", pm_text);
            sythechat_connection.send(new_message);
        } else {
            sythechat_send_message(the_box, "Invalid usage! Correct usage: /pm user_name Some message", "system");
        }
        break;
    case "ban":
        var ban_user = operand_one;
        var ban_text = operand_two;
        break;
    case "subject":
        var new_subject = operand_one + " " + operand_two;
        var subject_message = $msg({
            to: target_jid,
            "type": "groupchat"
        }).c('subject', new_subject);
        sythechat_connection.send(subject_message);
        break;
    case "kick":
        var kick_user = operand_one;
        var kick_text = operand_two;
        if (kick_user.length >= 1) {
            var iq = $iq({
                to: target_jid,
                type: 'set'
            }).c('query', {
                xmlns: 'http://jabber.org/protocol/muc#admin'
            }).c('item', {
                'nick': kick_user,
                'role': 'none'
            }).c('reason', kick_text);
            sythechat_connection.sendIQ(iq);
        } else {
            sythechat_send_message(the_box, "Invalid usage! Correct usage: /kick user_name Optional reason", "system");
        }
        break;
    default:
        sythechat_send_message(the_box, "Sorry, the command \"" + command_name + "\" was not recognized.", "system");
    }
}

function sythechat_process_parsables(message_body) {
    message_body = message_body.replace(/<[^>]+>/g, "");
    message_body = message_body.replace(/((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi, function (url) {
        var full_url = url;
        if (!full_url.match('^https?:\/\/')) {
            full_url = 'http://' + full_url;
        }
        return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
    });
    return message_body;
}

function sythechat_process_emoticons(message_body) {
    message_body = message_body.replace(/:-\|/gi, '<img src="//img.sythe.org/chat/emoticons/ambivalent.png" class="emoticon" />');
    message_body = message_body.replace(/&gt;:-\(/gi, '<img src="//img.sythe.org/chat/emoticons/angry.png" class="emoticon" />');
    message_body = message_body.replace(/:-S/gi, '<img src="//img.sythe.org/chat/emoticons/confused.png" class="emoticon" />');
    message_body = message_body.replace(/8-\)/gi, '<img src="//img.sythe.org/chat/emoticons/cool.png" class="emoticon" />');
    message_body = message_body.replace(/:-o/gi, '<img src="//img.sythe.org/chat/emoticons/gasp.png" class="emoticon" />');
    message_body = message_body.replace(/:-D/gi, '<img src="//img.sythe.org/chat/emoticons/grin.png" class="emoticon" />');
    message_body = message_body.replace(/&lt;3/gi, '<img src="//img.sythe.org/chat/emoticons/heart.png" class="emoticon" />');
    message_body = message_body.replace(/O:-\)/gi, '<img src="//img.sythe.org/chat/emoticons/innocent.png" class="emoticon" />');
    message_body = message_body.replace(/:-\*/gi, '<img src="//img.sythe.org/chat/emoticons/kiss.png" class="emoticon" />');
    message_body = message_body.replace(/&gt;:-\)/gi, '<img src="//img.sythe.org/chat/emoticons/naughty.png" class="emoticon" />');
    message_body = message_body.replace(/&gt;_&gt;/gi, '<img src="//img.sythe.org/chat/emoticons/not_amused.png" class="emoticon" />');
    message_body = message_body.replace(/:-\(/gi, '<img src="//img.sythe.org/chat/emoticons/sad.png" class="emoticon" />');
    message_body = message_body.replace(/:-\\/gi, '<img src="//img.sythe.org/chat/emoticons/slant.png" class="emoticon" />');
    message_body = message_body.replace(/:-\)/gi, '<img src="//img.sythe.org/chat/emoticons/smile.png" class="emoticon" />');
    message_body = message_body.replace(/:-P/gi, '<img src="//img.sythe.org/chat/emoticons/tongue.png" class="emoticon" />');
    message_body = message_body.replace(/;-\)/gi, '<img src="//img.sythe.org/chat/emoticons/wink.png" class="emoticon" />');
    message_body = message_body.replace(/:td:/gi, '<img src="//img.sythe.org/chat/emoticons/thumbs_down.png" class="emoticon" />');
    message_body = message_body.replace(/:tu:/gi, '<img src="//img.sythe.org/chat/emoticons/thumbs_up.png" class="emoticon" />');
    message_body = message_body.replace(/:android:/gi, '<img src="//img.sythe.org/chat/emoticons/android.png" class="emoticon" />');
    message_body = message_body.replace(/:boom:/gi, '<img src="//img.sythe.org/chat/emoticons/bomb.png" class="emoticon" />');
    message_body = message_body.replace(/:cake:/gi, '<img src="//img.sythe.org/chat/emoticons/cake.png" class="emoticon" />');
    message_body = message_body.replace(/:meow:/gi, '<img src="//img.sythe.org/chat/emoticons/cat.png" class="emoticon" />');
    message_body = message_body.replace(/:coins:/gi, '<img src="//img.sythe.org/chat/emoticons/coins.png" class="emoticon" />');
    message_body = message_body.replace(/:dice:/gi, '<img src="//img.sythe.org/chat/emoticons/dice.png" class="emoticon" />');
    message_body = message_body.replace(/:woof:/gi, '<img src="//img.sythe.org/chat/emoticons/dog.png" class="emoticon" />');
    message_body = message_body.replace(/:ban:/gi, '<img src="//img.sythe.org/chat/emoticons/hammer.png" class="emoticon" />');
    message_body = message_body.replace(/:hat:/gi, '<img src="//img.sythe.org/chat/emoticons/hat.png" class="emoticon" />');
    message_body = message_body.replace(/:heidy:/gi, '<img src="//img.sythe.org/chat/emoticons/heidy.png" class="emoticon" />');
    message_body = message_body.replace(/:pedo:/gi, '<img src="//img.sythe.org/chat/emoticons/kids.png" class="emoticon" />');
    message_body = message_body.replace(/:homo:/gi, '<img src="//img.sythe.org/chat/emoticons/rainbow.png" class="emoticon" />');
    message_body = message_body.replace(/:penguin:/gi, '<img src="//img.sythe.org/chat/emoticons/tux.png" class="emoticon" />');
    return message_body;
}

function sythechat_ongroupmessage(message) {
    var from_jid = $(message).attr('from');
    var short_jid = Strophe.getNodeFromJid(from_jid);
    var room_nick = Strophe.getResourceFromJid(from_jid);
    var css_class;
    sythechat_title_notify("New Message!");
    if (!room_nick) {
        room_nick = "*SYSTEM*";
        css_class = "system";
    }
    var this_box = "group_" + short_jid;
    if ($(message).children("subject").length > 0) {
        var new_subject = $(message).children("subject").text();
        sythechat_send_message(this_box, room_nick + " changed the room subject to: " + new_subject, "system");
    }
    if ($(message).children("body").length > 0) {
        var body = $(message).children('body').text();
        if (body) {
            if ($("#sythechat_chatarea").find("#" + this_box).length == 0) {
                sythechat_chatbox_create(from_jid, short_jid, false);
            }
            if (!sythechat_chatbox_visible(this_box)) {
                $("#sythechat_activechats_list").children("#group_" + short_jid + "_li").addClass("new_message");
                sythechat_activechat_alert(this_box);
            }
            var scrollback_div = $("#sythechat_chatarea").children("#" + this_box).find(".box_scrollback");
            body = sythechat_process_parsables(body);
            body = sythechat_process_emoticons(body);
            var human_time = "";
            var date_obj = new Date();
            if ($(message).children("delay").length > 0) {
                var delay_stamp = $(message).children("delay").attr("stamp");
                date_obj = new Date(delay_stamp);
            }
            human_time = ((date_obj.getHours() < 10) ? "0" + date_obj.getHours() : date_obj.getHours()) + ":" + ((date_obj.getMinutes() < 10) ? "0" + date_obj.getMinutes() : date_obj.getMinutes());
            sythechat_put_text_in_chat_box(this_box,
                    '<div class="group_message" from-jid="' + room_nick + '">' +
                        '<div' + (css_class ? ' class="' + css_class + '"' : "") + '>' +
                            '<span class="message_time">[' + human_time + ']</span>' +
                            '<span class="username">' + room_nick + "</span>: " + body +
                        '</div>' +
                    '</div>', false);
        }
    }
    return true;
}

/** 
 * @param box The chat box to put the text in
 * @param {String} text The text to put in the box
 * @param {Boolean} scroll Whether or not the box should be scrolled to the bottom after putting in the text
 */
function sythechat_put_text_in_chat_box(box, text, scroll) {
    var chat = $("#sythechat_chatarea").children("#" + box).find(".box_scrollback");
    var is_at_bottom = chat[0].scrollHeight - chat.scrollTop() === chat.innerHeight();   

    chat.append(text);
    
    if(scroll || is_at_bottom) {
        chat.scrollTop(chat[0].scrollHeight);
    }
}

function sythechat_onmessage(message) {
    sythechat_log("ONMESSAGE [" + message + "]");
    var from_jid = $(message).attr('from');
    var short_jid = Strophe.getNodeFromJid(from_jid);
    var group_chat = (Strophe.getDomainFromJid(from_jid) == conference_service ? true : false);
    if (group_chat && $(message).attr("type") != "groupchat") {
        if ($(message).find("invite").length > 0) {
            if (option_setting_invites == "1") {
                var this_invite = $(message).find("invite");
                sythechat_conference_oninvitation(from_jid, $(this_invite).attr('from'));
            }
        } else if ($(message).find("decline").length > 0) {
            var this_invite = $(message).find("decline");
            sythechat_dialog_message("Your invitation to " + $(this_invite).attr('from') + " was declined.");
        } else if ($(message).find("body").length > 0) {
            sythechat_send_message("group_" + short_jid, '[PRIVATE] <span class="username">' + Strophe.getResourceFromJid(from_jid) + "</span>: " + $(message).find("body").text(), "private");
        }
    } else {
        var composing = $(message).find("composing");
        if (composing.length > 0) {
            if ($("#sythechat_chatarea").children("#" + short_jid).children(".box_title").find("#is_typing").length == 0) {
                $("#sythechat_chatarea").children("#" + short_jid).children(".box_title").append('<span id="is_typing"> is typing...</span>');
                setTimeout(function () {
                    $("#sythechat_chatarea").children("#" + short_jid).children(".box_title").children("#is_typing").remove();
                }, 10000);
            }
        } else {
            sythechat_title_notify("New Message!");
        }
        var body = $(message).children('body').text();
        if (body) {
            if ($("#sythechat_chatarea").find("#" + short_jid).length == 0) {
                sythechat_chatbox_create(from_jid, short_jid, false);
            }
            if (!sythechat_chatbox_visible(short_jid)) {
                $("#sythechat_activechats_list").children("#" + short_jid + "_li").addClass("new_message");
                sythechat_activechat_alert(short_jid);
            }
            $("#sythechat_chatarea").children("#" + short_jid).children(".box_title").children("#is_typing").remove();
            var scrollback_div = $("#sythechat_chatarea").children("#" + short_jid).find(".box_scrollback");
            body = sythechat_process_parsables(body);
            body = sythechat_process_emoticons(body);
            var date_obj = new Date();
            var human_time = ((date_obj.getHours() < 10) ? "0" + date_obj.getHours() : date_obj.getHours()) + ":" + ((date_obj.getMinutes() < 10) ? "0" + date_obj.getMinutes() : date_obj.getMinutes());
            if (scrollback_div.find(".message").last().attr("from-jid") == short_jid) {
                scrollback_div.find(".message").last().find(".message_block").append('<div><span class="message_time">[' + human_time + ']</span> ' + body + '</div>');
            } else {
                scrollback_div.append('<div class="message" from-jid="' + short_jid + '"></div>');
                scrollback_div.find(".message").last().append('<img src="//img.sythe.org/chat/icons_small/user_red.png" class="user_icon" />');
                scrollback_div.find(".message").last().append('<div class="message_block"><div><span class="message_time">[' + human_time + ']</span> ' + body + '</div></div>');
            }
            scrollback_div.scrollTop(scrollback_div[0].scrollHeight);
        }
    }
    return true;
}

function sythechat_title_notify(the_title) {
    if (!sythechat_title_interval && !document.hasFocus()) {
        if (option_setting_sounds == "1") {
            document.getElementById('notification_sound').play();
        }
        sythechat_title_interval = setInterval(function () {
            if (document.hasFocus()) {
                document.title = "SytheChat";
                clearInterval(sythechat_title_interval);
                sythechat_title_interval = null;
            } else {
                document.title = document.title == the_title + " - SytheChat" ? "SytheChat" : the_title + " - SytheChat";
            }
        }, 2000);
    }
}

function sythechat_activechat_alert(this_box) {
    if (!sythechat_alert_activechats && !$("#sythechat_activechats_list").is(":visible") && !sythechat_chatbox_visible(this_box)) {
        sythechat_alert_activechats = setInterval(function (this_box) {
            if ($("#sythechat_activechats_list").is(":visible") || sythechat_chatbox_visible(this_box)) {
                $("a[href='#sythechat_tab_chats']").find("img").attr("src", "//img.sythe.org/chat/icons_large/comments.png");
                clearInterval(sythechat_alert_activechats);
                sythechat_alert_activechats = null;
            } else {
                if ($("a[href='#sythechat_tab_chats']").find("img").attr("src") == "//img.sythe.org/chat/icons_large/exclamation.png") {
                    $("a[href='#sythechat_tab_chats']").find("img").attr("src", "//img.sythe.org/chat/icons_large/comments.png");
                } else {
                    $("a[href='#sythechat_tab_chats']").find("img").attr("src", "//img.sythe.org/chat/icons_large/exclamation.png");
                }
            }
        }, 2000);
    }
}
$(document).ready(function () {
    sythechat_connection = new Strophe.Connection(BOSH_SERVICE);
    sythechat_connection.rawInput = sythechat_rawinput;
    sythechat_connection.rawOutput = sythechat_rawoutput;
    $(".show_online").hide();
    $(".show_offline").show();
    $.get("../simplename.php", function (response) {
        if (response.length > 0) {
            sythe_simplename = response;
            $.get("../xmpppass.php?" + Math.floor(1000000 * Math.random()), function (response) {
                if (response.length > 0 && response.indexOf("must be logged in") === -1) {
                    sythe_token = response;
                    $("#sythechat_login_messages").html("Logging you in...");
                    $("#sythechat_login_messages").show();
                    $("#sythechat_login_jid").val(sythe_simplename);
                    $("#sythechat_login_pass").val(sythe_token);
                    sythechat_connect($('#sythechat_login_jid').val(), $('#sythechat_login_pass').val());
                }
            });
        }
    });
    $('#sythechat_login_connect').click(function () {
        sythechat_connect($('#sythechat_login_jid').val(), $('#sythechat_login_pass').val());
    });
    $("#sythechat_login_pass").keypress(function (e) {
        if (e.which == 13) {
            $('#sythechat_login_connect').trigger("click");
        }
    });
    $("#sythechat_version_js").html(SYTHECHAT_VERSION_JS);
    $("#sythechat_version_html").html(SYTHECHAT_VERSION_HTML);
});

function send_disco(sythechat_myjid) {
    var xmpp_domain = Strophe.getDomainFromJid(sythechat_myjid);
    var iq = $iq({
        to: xmpp_domain,
        type: 'get'
    }).c('query', {
        xmlns: 'http://jabber.org/protocol/disco#items'
    });
    sythechat_connection.sendIQ(iq);
}

function send_disco_info(sythechat_myjid) {
    var xmpp_domain = Strophe.getDomainFromJid(sythechat_myjid);
    var iq = $iq({
        to: xmpp_domain,
        type: 'get'
    }).c('query', {
        xmlns: 'http://jabber.org/protocol/disco#info'
    });
    sythechat_connection.sendIQ(iq);
}

function send_history_1() {
    var xmpp_domain = Strophe.getDomainFromJid(sythechat_myjid);
    var iq = $iq({
        to: xmpp_domain,
        type: 'get'
    }).c('list', {
        xmlns: 'urn:xmpp:archive',
        "with": 'sythechat-test@chat.sythe.org'
    }).c('set', {
        xmlns: 'http://jabber.org/protocol/rsm'
    }).c('max', '30');
    sythechat_connection.sendIQ(iq);
}
/**
 * 
 * @returns {String} the current time in time stamp format
 */
function time_stamp() {
    var human_time = "";
    var date_obj = new Date();
    
    human_time = ((date_obj.getHours() < 10) ? "0" + date_obj.getHours() : date_obj.getHours()) + ":" + ((date_obj.getMinutes() < 10) ? "0" + date_obj.getMinutes() : date_obj.getMinutes());
    
    return '<span class="message_time">[' + human_time + ']</span>';
}
