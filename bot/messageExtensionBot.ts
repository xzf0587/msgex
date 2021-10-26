import { TeamsActivityHandler, CardFactory, TurnContext, AdaptiveCardInvokeValue, AdaptiveCardInvokeResponse, Attachment } from "botbuilder";
const rawLearnCard = require("./adaptiveCards/learn.json");
const ACData = require("adaptivecards-templating");

export class MessageExtensionBot extends TeamsActivityHandler {
  contents: { [key: string]: any; } = {};

  // Message Extension Code
  // Action.
  public async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: any
  ): Promise<any> {
    switch (action.commandId) {
      case "createCard":
        return this.createCardCommand(context, action);
      default:
        throw new Error("NotImplemented");
    }
  }

  public async handleAdaptiveCardAction(
    context: TurnContext
  ): Promise<AdaptiveCardInvokeResponse> {
    const invokeValue = context.activity.value;
    // The verb "userlike" is sent from the Adaptive Card defined in adaptiveCards/learn.json
    if (invokeValue.action.verb === "userlike") {
      this.contents[context.activity.replyToId].participators.push({ name: context.activity.from.name });
      const card = this.renderAdaptiveCard(rawLearnCard, this.contents[context.activity.replyToId]);
      await context.updateActivity({
        type: "message",
        id: context.activity.replyToId,
        attachments: [card],
      });
      return { statusCode: 200, type: undefined, value: undefined };
    }
  }

  // Invoked when an action is taken on an Adaptive Card. The Adaptive Card sends an event to the Bot and this
  // method handles that event.
  async onAdaptiveCardInvoke(
    context: TurnContext,
    invokeValue: AdaptiveCardInvokeValue
  ): Promise<AdaptiveCardInvokeResponse> {
    // The verb "userlike" is sent from the Adaptive Card defined in adaptiveCards/learn.json
    if (invokeValue.action.verb === "userlike") {
      this.contents[context.activity.replyToId].participators.push({ name: context.activity.from.name });
      const card = this.renderAdaptiveCard(rawLearnCard, this.contents[context.activity.replyToId]);
      await context.updateActivity({
        type: "message",
        id: context.activity.replyToId,
        attachments: [card],
      });
      return { statusCode: 200, type: undefined, value: undefined };
    }
  }

  public async handleTeamsMessagingExtensionSelectItem(
    context: TurnContext,
    obj: any
  ): Promise<any> {
    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [CardFactory.heroCard(obj.name, obj.description)],
      },
    };
  }

  // Bind AdaptiveCard with data
  renderAdaptiveCard(rawCardTemplate: any, dataObj?: any): Attachment {
    const cardTemplate = new ACData.Template(rawCardTemplate);
    const cardWithData = cardTemplate.expand({ $root: dataObj });
    const card = CardFactory.adaptiveCard(cardWithData);
    return card;
  }

  async createCardCommand(context: TurnContext, action: any): Promise<any> {
    const data = action.data;
    this.contents[context.activity.id] = {
      title: data.title,
      participators: [{ name: context.activity.from.name }]
    };
    // The user has chosen to create a card by choosing the 'Create Card' context menu command.
    const card = this.renderAdaptiveCard(rawLearnCard, this.contents[context.activity.id]);

    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [card],
      },
    };
  }
}

