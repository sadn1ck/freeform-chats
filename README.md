# Branching chats on a freeform canvas

What would a non traditional chat interface with LLMs look like? Right now - most are linear, with a single line of thought.

What if instead we had a canvas available for the user - where each conversation could be form with a combination of one or more nodes?

https://github.com/user-attachments/assets/c56408d7-1745-48e7-a0fd-c6c992ca2bb8

Here, each node on the canvas has a text field. You can join it to multiple other nodes via arrows. Once you click the (admittedly hard to click) magnifying glass button, I essentially go backwards, find all "threads" and return a final prompt consisting of these messages that we can send to the LLM.

**Where to next**

The possibilities are (actually) endless. Each node could be an instance that can do its own thing - an Agent. Or it could be specifically a transformer of some sort which takes in the previous accumulation of messages and returns a new message.

If you've seen some of TLDraw's demos, you'll definitely know that this type of interface is an extremely powerful tool on its own, but with LLMs you can supercharge them.
