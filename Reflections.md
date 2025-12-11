

## Reflections
### Benny
As part of this project I learned and improved on many things. I improved on my ability to code concepts and syncs, and use the concept tool in the process. I also gained important experience in working in a team on building a webapp. I have also improved on my ability to use llms affectively while coding. I have enjoyed this process of working with a team and found that it is much more manageable than working individually on a project.

### Yabetse

**Difficulties:

- A mistake my group and I made in the beginning was having less organized meetings that lasted very long, but at times resulted in very little progress. In order to avoid making this mistake in the future, it would be better to create a task lists with expected times for each task before each meeting. 
    
- Initially I expected it to be much easier to brainstorm ideas for our project since there were more ideas to bounce off of; however, this was more difficult than anticipated. 
    

- To make this easier next time maybe we could have come to our brainstorming meeting with three fleshed out ideas of our own to compare during the meeting. This would have likely saved more time. 
    
What went well/was easy:

- After the personal project, I felt so much more comfortable with using LLMs to code and experienced less “resistance” with the LLM tools context and cursor, and I understood how to communicate with the LLMs when resistance/conflict occurred. 
    
- Splitting work among 4 members by Concept made it so much easier to work independently since they are independent in nature, and collaboration for syncs went well as we all greatly understood the concepts we created because we were able to focus on only a couple concepts.
    
- Delegating work evenly was easier than expected and it was a really rewarding experience to be equally participating on an app as you feel you can rightfully take credit for the finished product
    
AI usage:

- Context was extremely helpful with taking our ideas for what we wanted in our app and giving use a set of possible concepts that could be helpful. We initially came up with our own set of concepts, but used context to confirm whether or not our set of concepts was reasonable. 
    
- Context was great at fleshing out concept specs and implementations
    
- Context was also great at creating an initial draft of syncs that we polished
    
- Cursor was extremely useful for creating a functional UI, but I found that making it MIT color themed with the LLM was much more difficult than when I polished the UI for my personal project. 
    
AI thoughts:

- I feel like as a developer learning about software AI usage at times did hinder learning as I felt that I could get away with a very basic understanding of full stack development
    
- However, it made creating an app much more frictionless and enjoyable as our ambitious ideas could come to life with less resistance than if we coded our entire code base independently**

### Betsegaw 

It sounds trite, but I learned the immense value of building incrementally (with concepts and syncs), especially when coding with LLMs (claude sonnet 4.5) and building more complex applications. Even with modular modifications there was sometimes a gap between what I said and meant by a prompt and what the LLM coded, so I can only imagine the difficulty in aligning my design choices and structure of the code if I weren't building incrementally. Secondly, I noticed unquantifiable but noticeable differences in how well different models executed my prompts. For the individual project, I used GPT 5 mostly, and it worked okay, but it seemed like Claude Sonnet 4.5 worked better. It could just be a placebo effect of knowing that Claude Sonnet 4.5 performed better on some benchmarks than GPT-5 did, as published by their respective developers. Additionally, I learned from our last meeting with Eagon before user testing the importance of showing in the UI as simply and explicitly as possible what the purpose of an app is. For our case, coordinating schedules with friends and group members, so making the small design choice to group shared class blocks together made a significant difference in how fast users of the app could understand what the app's purpose is and how to use it. Morever, since our team made a good-faith attempt at thinking through all the possible problems we wanted to work on during the Problem Framing phase, we were able to create a viable product and a product for which there is a real need for, which served as more motivation to create a well-designed app. However in this experimental process of using LLMs for coding, I found myself thinking "the more the LLM is the one explicitly writing most of the code, the less need/want for me to intervene." Since I didn't know the codebase as well as I would have had I coded it myself entirely/mostly, even when intervention was warranted I hesitated thinking that it would take too much time to sift through all of the code, so if after inputting some error the LLM quickly seemed to fix it, I didn't fully check its solution.  I also liked the context tool and using Obsidian to control the context that an LLM uses, as it still maintains the speed benefits of crafting code, etc.. while giving control back to the user through management of context.

### Giani 


My experience building CourseConnect was defined by bridging the gap between backend logic and meaningful user experience. While I successfully implemented the **Grouping** and **Authentication** concepts, my most significant learning curve involved performance optimization. I found that functional queries (60-80% of API requests were for usernames and other "simple" information so by utilizing local storage was able to reduce requests and make the app run faster) often created bottlenecks at scale; I learned to resist the "rabbit hole" of micro-optimizations and instead focus on identifying the specific architectural flaws slowing down our backend synchronizations.

On the frontend, I gained a deeper appreciation for **visual affordance**. I realized that displaying raw data isn't enough—we actually had to restrict schedule comparisons to three users to prevent cognitive overload. I learned that effective design requires semantically organizing information—such as distinguishing between Lectures and Labs or visualizing friend overlaps—so that users can intuitively understand their social and academic landscape without being overwhelmed.
